import { Router, raw } from "express";
import type Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import { getStripe } from "../services/stripe.js";
import { sendSolicitudRecibida } from "../services/email.js";

export const stripeWebhookRouter = Router();

const COMPANY_DISPLAY: Record<string, string> = {
  ATT: "AT&T",
  MOVISTAR: "Movistar",
  BAIT: "Bait",
};

type SolicitudLockRow = {
  id: number;
  estado: string;
  precioCotizado: number | null;
};

// Monta con express.raw() en esta misma ruta (no express.json()) — la
// verificación de firma de Stripe necesita los bytes exactos del body tal
// como los mandó Stripe. Esta ruta se registra en index.ts ANTES del
// express.json() global; si algún día ese orden cambia, este handler deja
// de poder verificar firmas (ver prueba mínima §11.1 del checklist).
stripeWebhookRouter.post("/", raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    res.status(400).send("Falta stripe-signature");
    return;
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body as Buffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Firma de webhook de Stripe inválida:", err);
    res.status(400).send("Firma inválida");
    return;
  }

  try {
    // Dedupe rápido: onConflict doNothing (skipDuplicates), sin 500 por
    // colisión si el mismo evento llega dos veces en paralelo.
    await prisma.stripeEvent.createMany({
      data: [{ id: event.id, type: event.type }],
      skipDuplicates: true,
    });
    const registro = await prisma.stripeEvent.findUniqueOrThrow({ where: { id: event.id } });
    if (registro.processedAt) {
      res.json({ received: true, duplicate: true });
      return;
    }

    let enviarCorreoSolicitudId: number | null = null;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const solicitudId = Number(session.metadata?.solicitudId);

      await prisma.$transaction(async (tx) => {
        const marcarProcesado = () =>
          tx.stripeEvent.update({ where: { id: event.id }, data: { processedAt: new Date() } });

        if (!Number.isInteger(solicitudId)) {
          await marcarProcesado();
          return;
        }

        const [solicitud] = await tx.$queryRaw<SolicitudLockRow[]>`
          SELECT id, estado, "precioCotizado" FROM "Solicitud" WHERE id = ${solicitudId} FOR UPDATE
        `;

        if (!solicitud || solicitud.estado !== "RECIBIDA") {
          // No existe, o ya se procesó por otra vía (reintento del webhook,
          // entrega concurrente) — no-op idempotente.
          await marcarProcesado();
          return;
        }

        if (session.payment_status !== "paid") {
          // El Checkout Session se completó pero el pago no quedó 'paid'
          // (ej. 3DS pendiente). No se transiciona.
          await marcarProcesado();
          return;
        }

        const montoCoincide =
          session.amount_total === solicitud.precioCotizado && session.currency === "mxn";

        if (montoCoincide) {
          await tx.solicitud.update({
            where: { id: solicitud.id },
            data: { estado: "PAGO_VALIDADO", stripeSessionId: session.id },
          });
          await tx.historialEstado.create({
            data: {
              solicitudId: solicitud.id,
              estadoAnterior: "RECIBIDA",
              estadoNuevo: "PAGO_VALIDADO",
              adminId: null,
              observacion: "Confirmado automáticamente vía Stripe",
            },
          });
          enviarCorreoSolicitudId = solicitud.id;
        } else {
          // stripeSessionId se escribe también aquí: es un identificador de
          // correlación para rastrear el pago desde la solicitud, no una
          // marca de éxito.
          await tx.solicitud.update({
            where: { id: solicitud.id },
            data: {
              stripeSessionId: session.id,
              observacion: `Discrepancia de monto Stripe: esperado ${solicitud.precioCotizado ?? "?"} centavos (mxn), recibido ${session.amount_total ?? "?"} ${session.currency ?? "?"}`,
            },
          });
        }

        await marcarProcesado();
      });
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const solicitudId = Number(session.metadata?.solicitudId);

      await prisma.$transaction(async (tx) => {
        const marcarProcesado = () =>
          tx.stripeEvent.update({ where: { id: event.id }, data: { processedAt: new Date() } });

        if (!Number.isInteger(solicitudId)) {
          await marcarProcesado();
          return;
        }

        const [solicitud] = await tx.$queryRaw<SolicitudLockRow[]>`
          SELECT id, estado, "precioCotizado" FROM "Solicitud" WHERE id = ${solicitudId} FOR UPDATE
        `;

        if (solicitud && solicitud.estado === "RECIBIDA") {
          const observacion = "Checkout de Stripe expiró sin completar el pago";
          await tx.solicitud.update({
            where: { id: solicitud.id },
            data: { estado: "CANCELADA", observacion },
          });
          await tx.historialEstado.create({
            data: {
              solicitudId: solicitud.id,
              estadoAnterior: "RECIBIDA",
              estadoNuevo: "CANCELADA",
              adminId: null,
              observacion,
            },
          });
        }

        await marcarProcesado();
      });
    } else if (event.type === "charge.dispute.created") {
      const dispute = event.data.object as Stripe.Dispute;
      // No es una transición de estado — no existe "en disputa" en el flujo.
      // Se registra y alerta operativamente; ip/userAgent/createdAt de la
      // Solicitud (si se puede correlacionar por stripeSessionId vía el
      // PaymentIntent/charge) quedan como evidencia disponible para el
      // panel admin al responder el contracargo ante Stripe.
      console.error("[ALERTA][stripe] charge.dispute.created", {
        disputeId: dispute.id,
        chargeId: dispute.charge,
        amount: dispute.amount,
        reason: dispute.reason,
      });
      await prisma.stripeEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date() },
      });
    } else {
      // Evento no manejado — default silencioso, se marca procesado para no
      // reintentar indefinidamente pero no dispara lógica de negocio.
      await prisma.stripeEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date() },
      });
    }

    res.json({ received: true });

    if (enviarCorreoSolicitudId !== null) {
      const solicitud = await prisma.solicitud.findUnique({
        where: { id: enviarCorreoSolicitudId },
        include: { plan: { select: { precio: true, recarga: true } } },
      });
      if (solicitud) {
        sendSolicitudRecibida({
          folio: solicitud.publicCode,
          to: solicitud.email,
          nombre: solicitud.nombre,
          compania: COMPANY_DISPLAY[solicitud.compania] ?? solicitud.compania,
          companiaCode: solicitud.compania,
          precio: solicitud.plan.precio.toString(),
          recarga: solicitud.plan.recarga.toString(),
        }).catch((err) => console.error("Error enviando correo SolicitudRecibida (Stripe):", err));
      }
    }
  } catch (err) {
    // No se marcó processedAt (o la transacción completa hizo rollback) —
    // Stripe reintenta el evento completo desde cero.
    console.error("Error procesando webhook de Stripe:", err);
    res.status(500).json({ error: "internal" });
  }
});
