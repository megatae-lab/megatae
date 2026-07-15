import { Router } from "express";
import { z } from "zod";
import { EstadoSolicitud } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { transicionValida } from "../../lib/transitions.js";
import { sendPagoRechazado, sendQrEnviado } from "../../services/email.js";
import { generatePresignedUploadUrl, isAllowedType } from "../../services/r2.js";
import { siredAdapter } from "../../services/sired.js";
import type { AuthRequest } from "../../middleware/auth.js";

export const adminSolicitudesRouter = Router();

const COMPANY_DISPLAY: Record<string, string> = {
  ATT: "AT&T",
  MOVISTAR: "Movistar",
  BAIT: "Bait",
};

// GET /api/admin/solicitudes?estado=X
adminSolicitudesRouter.get("/", async (req, res, next) => {
  try {
    const estado = req.query.estado as EstadoSolicitud | undefined;
    const where = estado && Object.values(EstadoSolicitud).includes(estado)
      ? { estado }
      : {};

    const solicitudes = await prisma.solicitud.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        nombre: true,
        email: true,
        compania: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
        plan: { select: { precio: true, recarga: true } },
      },
    });

    res.json(solicitudes);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/solicitudes/:id
adminSolicitudesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
      include: {
        plan: { select: { precio: true, recarga: true } },
        historial: {
          orderBy: { createdAt: "asc" },
          include: { admin: { select: { nombre: true } } },
        },
      },
    });

    if (!solicitud) { res.status(404).json({ error: "Solicitud no encontrada" }); return; }

    res.json(solicitud);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/solicitudes/:id/estado
const transicionSchema = z.object({
  estadoNuevo: z.nativeEnum(EstadoSolicitud),
  observacion: z.string().optional(),
});

adminSolicitudesRouter.patch("/:id/estado", async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const { estadoNuevo, observacion } = transicionSchema.parse(req.body);

    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
      select: { estado: true, email: true, nombre: true, compania: true, dn: true },
    });
    if (!solicitud) { res.status(404).json({ error: "Solicitud no encontrada" }); return; }

    if (!transicionValida(solicitud.estado, estadoNuevo)) {
      res.status(422).json({
        error: `No se puede pasar de ${solicitud.estado} a ${estadoNuevo}`,
      });
      return;
    }

    if (estadoNuevo === "PAGO_RECHAZADO" && !observacion?.trim()) {
      res.status(422).json({ error: "La observación es requerida para rechazar el pago" });
      return;
    }

    await prisma.$transaction([
      prisma.solicitud.update({
        where: { id },
        data: {
          estado: estadoNuevo,
          ...(observacion ? { observacion } : {}),
        },
      }),
      prisma.historialEstado.create({
        data: {
          solicitudId: id,
          estadoAnterior: solicitud.estado,
          estadoNuevo,
          adminId: req.admin!.id,
          observacion: observacion ?? null,
        },
      }),
    ]);

    if (estadoNuevo === "PAGO_RECHAZADO") {
      sendPagoRechazado({
        to: solicitud.email,
        nombre: solicitud.nombre,
        compania: COMPANY_DISPLAY[solicitud.compania] ?? solicitud.compania,
        observacion: observacion!,
      }).catch((err) => console.error("Error enviando correo PagoRechazado:", err));
    }

    if (estadoNuevo === "ACTIVADA" && solicitud.dn) {
      siredAdapter
        .reportarVenta(id, solicitud.dn, solicitud.compania)
        .catch((err) => console.error("Error reportando venta a SIRED:", err));
    }

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});

// POST /api/admin/solicitudes/:id/qr/presigned-url
const qrPresignedSchema = z.object({
  contentType: z.string().refine(
    (v) => isAllowedType(v) && v !== "application/pdf",
    { message: "Solo se aceptan imágenes JPG o PNG para el QR" }
  ),
});

adminSolicitudesRouter.post("/:id/qr/presigned-url", async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const { contentType } = qrPresignedSchema.parse(req.body);

    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
      select: { estado: true },
    });
    if (!solicitud) { res.status(404).json({ error: "Solicitud no encontrada" }); return; }
    if (solicitud.estado !== "EN_ACTIVACION") {
      res.status(422).json({ error: "La solicitud no está en activación" });
      return;
    }

    const result = await generatePresignedUploadUrl(contentType, "qr");
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});

// POST /api/admin/solicitudes/:id/qr
const qrSchema = z.object({
  qrUrl: z.string().url("URL de QR inválida"),
  dn: z.string().min(1, "El DN es requerido"),
});

adminSolicitudesRouter.post("/:id/qr", async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const { qrUrl, dn } = qrSchema.parse(req.body);

    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
      select: { estado: true, email: true, nombre: true, compania: true },
    });
    if (!solicitud) { res.status(404).json({ error: "Solicitud no encontrada" }); return; }
    if (solicitud.estado !== "EN_ACTIVACION") {
      res.status(422).json({ error: "La solicitud no está en activación" });
      return;
    }

    await prisma.$transaction([
      prisma.solicitud.update({
        where: { id },
        data: { qrUrl, dn, estado: "QR_ENVIADO" },
      }),
      prisma.historialEstado.create({
        data: {
          solicitudId: id,
          estadoAnterior: "EN_ACTIVACION",
          estadoNuevo: "QR_ENVIADO",
          adminId: req.admin!.id,
        },
      }),
    ]);

    sendQrEnviado({
      to: solicitud.email,
      nombre: solicitud.nombre,
      compania: COMPANY_DISPLAY[solicitud.compania] ?? solicitud.compania,
      dn,
      qrUrl,
    }).catch((err) => console.error("Error enviando correo QrEnviado:", err));

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});
