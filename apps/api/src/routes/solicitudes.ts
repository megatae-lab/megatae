import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { generatePresignedUploadUrl, isAllowedType } from "../services/r2.js";
import { sendSolicitudRecibida, sendFueraDeHorario, isWithinBusinessHours } from "../services/email.js";
import { conPublicCodeUnico, generateAccessToken, ACCESS_TOKEN_TTL_MS } from "../lib/tokens.js";
import { getStripe, precioACentavos } from "../services/stripe.js";

export const solicitudesRouter = Router();

const COMPANY_DISPLAY: Record<string, string> = {
  ATT: "AT&T",
  MOVISTAR: "Movistar",
  BAIT: "Bait",
};

// POST /api/solicitudes/presigned-url
// Body: { contentType: "image/jpeg" | "image/png" | "application/pdf" }
// Returns: { uploadUrl, publicUrl }
const presignedSchema = z.object({
  contentType: z.string().refine(isAllowedType, {
    message: "Solo se aceptan imágenes JPG, PNG o archivos PDF",
  }),
});

solicitudesRouter.post("/presigned-url", async (req, res, next) => {
  try {
    const { contentType } = presignedSchema.parse(req.body);
    const result = await generatePresignedUploadUrl(contentType);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});

// Campos comunes a ambos métodos de pago (transferencia y Stripe). El
// comprobante se valida aparte porque solo aplica a transferencia.
const datosClienteSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Correo inválido"),
  ciudad: z.string().optional(),
  estadoMx: z.string().optional(),
  lada: z.string().optional(),
  compania: z.enum(["ATT", "MOVISTAR", "BAIT"]),
  planId: z.number().int().positive(),
});

function requiereLadaAtt<T extends { compania: string; lada?: string }>(data: T) {
  return data.compania !== "ATT" || !!data.lada;
}

// Valida el plan contra la BD y regresa el error 422 correspondiente si no
// aplica — se usa igual en el flujo de transferencia y en el de Stripe. El
// precio SIEMPRE se lee de aquí, nunca del body del cliente.
async function validarPlan(planId: number, compania: string) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || plan.compania !== compania || !plan.activo) {
    return { plan: null as null, error: "Plan inválido o no disponible" };
  }
  return { plan, error: null as null };
}

// POST /api/solicitudes — flujo de transferencia bancaria (comprobante
// subido a mano por el cliente, revisado por mesa de control).
const solicitudSchema = datosClienteSchema
  .extend({ comprobanteUrl: z.string().url("URL de comprobante inválida") })
  .refine(requiereLadaAtt, { message: "Selecciona tu LADA para AT&T", path: ["lada"] });

solicitudesRouter.post("/", async (req, res, next) => {
  try {
    const body = solicitudSchema.parse(req.body);

    const { plan, error } = await validarPlan(body.planId, body.compania);
    if (!plan) {
      res.status(422).json({ error });
      return;
    }

    // Movistar y Bait siempre 55; AT&T usa el valor elegido por el cliente
    const lada = body.compania === "ATT" ? body.lada : "55";

    const solicitud = await conPublicCodeUnico((publicCode) =>
      prisma.solicitud.create({
        data: {
          publicCode,
          nombre: body.nombre,
          email: body.email,
          ciudad: body.ciudad,
          estadoMx: body.estadoMx,
          lada,
          compania: body.compania,
          planId: body.planId,
          comprobante: body.comprobanteUrl,
          metodoPago: "TRANSFERENCIA",
        },
      })
    );

    // Fire-and-forget: un error de correo no debe revertir la solicitud ya guardada
    sendSolicitudRecibida({
      folio: solicitud.publicCode,
      to: body.email,
      nombre: body.nombre,
      compania: COMPANY_DISPLAY[body.compania] ?? body.compania,
      companiaCode: body.compania,
      precio: plan.precio.toString(),
      recarga: plan.recarga.toString(),
    }).catch((err) => {
      console.error("Error enviando correo SolicitudRecibida:", err);
    });

    if (!isWithinBusinessHours()) {
      sendFueraDeHorario({ folio: solicitud.publicCode, to: body.email, nombre: body.nombre }).catch((err) => {
        console.error("Error enviando correo FueraDeHorario:", err);
      });
    }

    // `id` se mantiene por compatibilidad con el frontend actual (Iteración 2
    // lo retira). `publicCode` es el folio que debe usarse desde ahora.
    res.status(201).json({ ok: true, id: solicitud.id, publicCode: solicitud.publicCode });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});

// POST /api/solicitudes/stripe/checkout — crea la Solicitud (RECIBIDA, sin
// comprobante) y el Checkout Session de Stripe. La Solicitud se crea AQUÍ,
// antes del redirect — no en el webhook — para no tener que mandar datos
// personales como metadata a Stripe (ver docs/ARCHITECTURE.md).
const stripeCheckoutSchema = datosClienteSchema.refine(requiereLadaAtt, {
  message: "Selecciona tu LADA para AT&T",
  path: ["lada"],
});

solicitudesRouter.post("/stripe/checkout", async (req, res, next) => {
  try {
    const body = stripeCheckoutSchema.parse(req.body);

    const { plan, error } = await validarPlan(body.planId, body.compania);
    if (!plan) {
      res.status(422).json({ error });
      return;
    }

    const lada = body.compania === "ATT" ? body.lada : "55";
    const precioCotizado = precioACentavos(plan.precio);
    const accessToken = generateAccessToken();
    const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);

    const solicitud = await conPublicCodeUnico((publicCode) =>
      prisma.solicitud.create({
        data: {
          publicCode,
          nombre: body.nombre,
          email: body.email,
          ciudad: body.ciudad,
          estadoMx: body.estadoMx,
          lada,
          compania: body.compania,
          planId: body.planId,
          comprobante: null,
          metodoPago: "STRIPE",
          precioCotizado,
          accessToken,
          accessTokenExpiresAt,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        },
      })
    );

    try {
      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: body.email,
        line_items: [
          {
            price_data: {
              currency: "mxn",
              product_data: {
                name: `eSIM ${COMPANY_DISPLAY[body.compania] ?? body.compania} — Folio ${solicitud.publicCode}`,
              },
              unit_amount: precioCotizado,
            },
            quantity: 1,
          },
        ],
        metadata: { solicitudId: String(solicitud.id) },
        success_url: `${process.env.WEB_URL}/gracias?token=${accessToken}`,
        cancel_url: `${process.env.WEB_URL}/comprar?stripe=cancelado`,
      });

      await prisma.solicitud.update({
        where: { id: solicitud.id },
        data: { stripeSessionId: session.id },
      });

      res.json({ url: session.url });
    } catch (stripeErr) {
      // No dejar una Solicitud huérfana en RECIBIDA si Stripe nunca pudo
      // iniciar el checkout — nada más la referencia todavía (sin
      // HistorialEstado, sin stripeSessionId).
      await prisma.solicitud.delete({ where: { id: solicitud.id } }).catch(() => {});
      console.error("Error creando Checkout Session de Stripe:", stripeErr);
      res.status(502).json({ error: "No se pudo iniciar el pago con tarjeta. Intenta de nuevo." });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});

// GET /api/solicitudes/by-token/:accessToken — usado solo por /gracias justo
// después del redirect de Stripe. Respuesta genérica si el token no existe o
// expiró (48h) — no distingue el motivo.
solicitudesRouter.get("/by-token/:accessToken", async (req, res, next) => {
  try {
    const solicitud = await prisma.solicitud.findUnique({
      where: { accessToken: req.params.accessToken },
      select: { publicCode: true, estado: true, nombre: true, compania: true, email: true, accessTokenExpiresAt: true },
    });

    if (!solicitud || !solicitud.accessTokenExpiresAt || solicitud.accessTokenExpiresAt < new Date()) {
      res.status(404).json({ error: "No encontrado" });
      return;
    }

    // El token en sí es la prueba de acceso (256 bits, un solo propósito) —
    // devolver el correo aquí es seguro y permite mostrar "revisa tu correo
    // en X" igual que en el flujo de transferencia.
    res.json({
      publicCode: solicitud.publicCode,
      estado: solicitud.estado,
      nombre: solicitud.nombre,
      compania: solicitud.compania,
      email: solicitud.email,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/solicitudes/consultar — consulta de estado general, cualquier
// método de pago. Exige folio + correo coincidentes; respuesta genérica ante
// no-match (no revela si el folio existe pero el correo no coincide, o si el
// folio no existe).
const consultarSchema = z.object({
  folio: z.string().min(1),
  email: z.string().email(),
});

solicitudesRouter.post("/consultar", async (req, res, next) => {
  try {
    const { folio, email } = consultarSchema.parse(req.body);

    // Fallback por prefijo: los correos enviados antes de esta migración
    // referencian el `id` numérico como folio. Retirar este fallback 6 meses
    // después del backfill en producción (ver docs/ARCHITECTURE.md).
    const esPublicCode = folio.startsWith("MT-");
    const idNumerico = Number(folio);
    if (!esPublicCode && !Number.isInteger(idNumerico)) {
      res.status(404).json({ error: "No encontrado" });
      return;
    }

    const solicitud = await prisma.solicitud.findUnique({
      where: esPublicCode ? { publicCode: folio } : { id: idNumerico },
      select: { publicCode: true, estado: true, nombre: true, compania: true, email: true },
    });

    if (!solicitud || solicitud.email.toLowerCase() !== email.toLowerCase()) {
      res.status(404).json({ error: "No encontrado" });
      return;
    }

    res.json({
      publicCode: solicitud.publicCode,
      estado: solicitud.estado,
      nombre: solicitud.nombre,
      compania: solicitud.compania,
      email: solicitud.email,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(404).json({ error: "No encontrado" });
      return;
    }
    next(err);
  }
});
