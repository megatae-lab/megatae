import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { generatePresignedUploadUrl, isAllowedType } from "../services/r2.js";
import { sendSolicitudRecibida } from "../services/email.js";

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

// POST /api/solicitudes
const solicitudSchema = z
  .object({
    nombre: z.string().min(2, "Nombre muy corto"),
    email: z.string().email("Correo inválido"),
    telefono: z.string().min(10, "Teléfono inválido"),
    ciudad: z.string().optional(),
    estadoMx: z.string().optional(),
    lada: z.string().optional(),
    compania: z.enum(["ATT", "MOVISTAR", "BAIT"]),
    planId: z.number().int().positive(),
    comprobanteUrl: z.string().url("URL de comprobante inválida"),
  })
  .refine((data) => data.compania !== "ATT" || !!data.lada, {
    message: "Selecciona tu LADA para AT&T",
    path: ["lada"],
  });

solicitudesRouter.post("/", async (req, res, next) => {
  try {
    const body = solicitudSchema.parse(req.body);

    const plan = await prisma.plan.findUnique({ where: { id: body.planId } });
    if (!plan || plan.compania !== body.compania || !plan.activo) {
      res.status(422).json({ error: "Plan inválido o no disponible" });
      return;
    }

    // Movistar y Bait siempre 55; AT&T usa el valor elegido por el cliente
    const lada = body.compania === "ATT" ? body.lada : "55";

    const solicitud = await prisma.solicitud.create({
      data: {
        nombre: body.nombre,
        email: body.email,
        telefono: body.telefono,
        ciudad: body.ciudad,
        estadoMx: body.estadoMx,
        lada,
        compania: body.compania,
        planId: body.planId,
        comprobante: body.comprobanteUrl,
      },
    });

    // Fire-and-forget: un error de correo no debe revertir la solicitud ya guardada
    sendSolicitudRecibida({
      to: body.email,
      nombre: body.nombre,
      compania: COMPANY_DISPLAY[body.compania] ?? body.compania,
      precio: plan.precio.toString(),
      recarga: plan.recarga.toString(),
    }).catch((err) => {
      console.error("Error enviando correo SolicitudRecibida:", err);
    });

    res.status(201).json({ ok: true, id: solicitud.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});
