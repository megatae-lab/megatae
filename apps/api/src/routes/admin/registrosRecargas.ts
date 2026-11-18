import { Router } from "express";
import { z } from "zod";
import { EstadoRegistro, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { transicionRegistroValida } from "../../lib/transitions.js";
import { etiquetaGiro } from "../../lib/giros.js";
import { montoMinimoRegistro, formatMonto } from "../../lib/recargas.js";
import { requireRol } from "../../middleware/auth.js";
import type { AuthRequest } from "../../middleware/auth.js";
import { sendRegistroRecargasRechazado, sendCredencialesRecargas } from "../../services/email.js";
import { logger } from "../../lib/logger.js";

// Panel de registros de negocios para recargas. A diferencia de las rutas de
// eSIM, el rol se valida aquí en el backend (solo PRO y RECARGAS), no solo
// en el frontend: este módulo entrega credenciales de acceso.
export const adminRegistrosRecargasRouter = Router();
adminRegistrosRecargasRouter.use(requireRol("PRO", "RECARGAS"));

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function parseId(raw: unknown): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "ID inválido");
  return id;
}

function handleError(err: unknown, res: import("express").Response, next: import("express").NextFunction) {
  if (err instanceof z.ZodError) {
    res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  next(err);
}

// GET /api/admin/registros-recargas?estado=X
adminRegistrosRecargasRouter.get("/", async (req, res, next) => {
  try {
    const estado = req.query.estado as EstadoRegistro | undefined;
    const where = estado && Object.values(EstadoRegistro).includes(estado) ? { estado } : {};

    const registros = await prisma.registroRecargas.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        publicCode: true,
        nombreCompleto: true,
        nombreNegocio: true,
        giro: true,
        giroOtro: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(registros.map((r) => ({ ...r, giroEtiqueta: etiquetaGiro(r.giro, r.giroOtro) })));
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/registros-recargas/:id
adminRegistrosRecargasRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const registro = await prisma.registroRecargas.findUnique({
      where: { id },
      include: {
        historial: {
          orderBy: { createdAt: "asc" },
          include: { admin: { select: { nombre: true } } },
        },
      },
    });
    if (!registro) throw new HttpError(404, "Registro no encontrado");

    res.json({
      ...registro,
      giroEtiqueta: etiquetaGiro(registro.giro, registro.giroOtro),
      montoMinimo: montoMinimoRegistro(),
    });
  } catch (err) {
    handleError(err, res, next);
  }
});

// PATCH /api/admin/registros-recargas/:id/estado
const transicionSchema = z.object({
  estadoNuevo: z.nativeEnum(EstadoRegistro),
  observacion: z.string().trim().max(500).optional(),
  montoValidado: z.number().positive().max(1_000_000).optional(),
});

adminRegistrosRecargasRouter.patch("/:id/estado", async (req: AuthRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { estadoNuevo, observacion, montoValidado } = transicionSchema.parse(req.body);
    const minimo = montoMinimoRegistro();

    if (estadoNuevo === "PAGO_RECHAZADO" && !observacion) {
      throw new HttpError(422, "La observación es requerida para rechazar el pago");
    }
    if (estadoNuevo === "PAGO_VALIDADO") {
      if (montoValidado === undefined) {
        throw new HttpError(422, "Captura el monto del comprobante para validar el pago");
      }
      if (montoValidado < minimo) {
        throw new HttpError(422, `El monto es menor al mínimo de $${formatMonto(minimo)} MXN — rechaza el pago`);
      }
    }

    const registro = await prisma.$transaction(async (tx) => {
      const actual = await tx.registroRecargas.findUnique({
        where: { id },
        select: { estado: true, email: true, nombreCompleto: true, publicCode: true },
      });
      if (!actual) throw new HttpError(404, "Registro no encontrado");
      if (!transicionRegistroValida(actual.estado, estadoNuevo)) {
        throw new HttpError(422, `No se puede pasar de ${actual.estado} a ${estadoNuevo}`);
      }

      // Update condicionado al estado leído: si otro admin lo movió entre la
      // lectura y aquí, count = 0 y no se pisa su cambio.
      const { count } = await tx.registroRecargas.updateMany({
        where: { id, estado: actual.estado },
        data: {
          estado: estadoNuevo,
          ...(observacion ? { observacion } : {}),
          ...(estadoNuevo === "PAGO_VALIDADO" ? { montoValidado: new Prisma.Decimal(montoValidado!) } : {}),
        },
      });
      if (count === 0) throw new HttpError(409, "El registro cambió mientras lo editabas. Recarga la página.");

      await tx.historialRegistroRecargas.create({
        data: {
          registroId: id,
          estadoAnterior: actual.estado,
          estadoNuevo,
          adminId: req.admin!.id,
          observacion:
            observacion ??
            (estadoNuevo === "PAGO_VALIDADO" ? `Monto validado: $${formatMonto(montoValidado!)} MXN` : null),
        },
      });
      return actual;
    });

    if (estadoNuevo === "PAGO_RECHAZADO") {
      sendRegistroRecargasRechazado({
        folio: registro.publicCode,
        to: registro.email,
        nombre: registro.nombreCompleto,
        observacion: observacion!,
        montoMinimo: formatMonto(minimo),
      }).catch((err) => console.error("Error enviando correo RegistroRecargasRechazado:", err));
    }

    res.json({ ok: true });
  } catch (err) {
    handleError(err, res, next);
  }
});

// POST /api/admin/registros-recargas/:id/credenciales
// La contraseña solo vive en memoria durante esta petición: se manda en el
// correo y se descarta. No se guarda en BD ni se escribe en logs.
const credencialesSchema = z.object({
  usuario: z.string().trim().min(3, "El usuario debe tener al menos 3 caracteres").max(80),
  contrasena: z.string().min(4, "La contraseña debe tener al menos 4 caracteres").max(80),
});

adminRegistrosRecargasRouter.post("/:id/credenciales", async (req: AuthRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { usuario, contrasena } = credencialesSchema.parse(req.body);

    // El correo se envía dentro de la transacción: si Resend falla, se hace
    // rollback y el registro se queda en PAGO_VALIDADO para reintentar. El
    // update condicionado evita enviar dos veces si el admin da doble clic.
    await prisma.$transaction(
      async (tx) => {
        const registro = await tx.registroRecargas.findUnique({
          where: { id },
          select: { estado: true, email: true, nombreCompleto: true, nombreNegocio: true, publicCode: true },
        });
        if (!registro) throw new HttpError(404, "Registro no encontrado");
        if (registro.estado !== "PAGO_VALIDADO") {
          throw new HttpError(422, "Solo se pueden enviar credenciales con el pago validado");
        }

        const { count } = await tx.registroRecargas.updateMany({
          where: { id, estado: "PAGO_VALIDADO" },
          data: {
            estado: "CREDENCIALES_ENVIADAS",
            usuarioPlataforma: usuario,
            credencialesEnviadasAt: new Date(),
          },
        });
        if (count === 0) throw new HttpError(409, "Las credenciales ya se están enviando");

        await tx.historialRegistroRecargas.create({
          data: {
            registroId: id,
            estadoAnterior: "PAGO_VALIDADO",
            estadoNuevo: "CREDENCIALES_ENVIADAS",
            adminId: req.admin!.id,
            observacion: `Usuario enviado: ${usuario}`,
          },
        });

        try {
          await sendCredencialesRecargas({
            folio: registro.publicCode,
            to: registro.email,
            nombre: registro.nombreCompleto,
            nombreNegocio: registro.nombreNegocio,
            usuario,
            contrasena,
          });
        } catch (err) {
          logger.error({ registroId: id, msg: (err as Error).message }, "Fallo envío de credenciales de recargas");
          throw new HttpError(502, "No se pudo enviar el correo. Intenta de nuevo en unos minutos.");
        }
      },
      { timeout: 20_000 }
    );

    res.json({ ok: true });
  } catch (err) {
    handleError(err, res, next);
  }
});
