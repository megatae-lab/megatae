import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { generatePresignedUploadUrl, isAllowedType } from "../services/r2.js";
import { sendRegistroRecargasRecibido, sendNuevoRegistroRecargas } from "../services/email.js";
import { conPublicCodeUnico, PUBLIC_CODE_PREFIX_RECARGAS } from "../lib/tokens.js";
import { GIROS_NEGOCIO, GIRO_OTRO, esGiroValido, etiquetaGiro } from "../lib/giros.js";
import { montoMinimoRegistro, formatMonto } from "../lib/recargas.js";

// Rutas públicas del registro de negocios para recargas. Solo transferencia
// bancaria — Stripe no aplica a este módulo. Ver docs/ARCHITECTURE.md §17.
export const registrosRecargasRouter = Router();

function zodError(err: z.ZodError) {
  return err.errors[0]?.message ?? "Datos inválidos";
}

// GET /api/registros-recargas/config
// Todo lo que el formulario necesita en una sola llamada: monto mínimo,
// catálogo de giros y cuentas bancarias de recargas (nunca las de eSIM).
registrosRecargasRouter.get("/config", async (_req, res, next) => {
  try {
    const cuentas = await prisma.cuentaBancaria.findMany({
      where: { activo: true, destino: "RECARGAS" },
      orderBy: { orden: "asc" },
      select: { id: true, banco: true, titular: true, cuenta: true, clabe: true },
    });
    res.json({
      montoMinimo: montoMinimoRegistro(),
      giros: GIROS_NEGOCIO.filter((g) => g.activo).map(({ clave, etiqueta }) => ({ clave, etiqueta })),
      cuentas,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/registros-recargas/presigned-url
const presignedSchema = z.object({
  contentType: z.string().refine(isAllowedType, {
    message: "Solo se aceptan imágenes JPG, PNG o archivos PDF",
  }),
});

registrosRecargasRouter.post("/presigned-url", async (req, res, next) => {
  try {
    const { contentType } = presignedSchema.parse(req.body);
    const result = await generatePresignedUploadUrl(contentType, "comprobantes-recargas");
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: zodError(err) });
      return;
    }
    next(err);
  }
});

// POST /api/registros-recargas
const registroSchema = z
  .object({
    nombreCompleto: z.string().trim().min(3, "Escribe tu nombre completo").max(120),
    email: z.string().trim().toLowerCase().email("Correo inválido").max(160),
    telefono: z
      .string()
      .trim()
      .transform((v) => v.replace(/[\s()-]/g, ""))
      .refine((v) => /^\+?\d{10,13}$/.test(v), { message: "Número telefónico inválido (10 dígitos)" }),
    nombreNegocio: z.string().trim().min(2, "Escribe el nombre de tu negocio").max(120),
    giro: z.string().refine(esGiroValido, { message: "Selecciona el giro de tu negocio" }),
    giroOtro: z.string().trim().max(80).optional(),
    comprobanteUrl: z.string().url("Comprobante inválido"),
  })
  .refine((d) => d.giro !== GIRO_OTRO || (d.giroOtro?.length ?? 0) >= 3, {
    message: "Especifica el giro de tu negocio",
    path: ["giroOtro"],
  });

// El comprobante debe venir del bucket propio (R2_PUBLIC_URL): evita que se
// registre una URL arbitraria de otro sitio como "comprobante".
function esUrlDeBucket(url: string): boolean {
  const base = process.env.R2_PUBLIC_URL;
  return !base || url.startsWith(`${base}/`);
}

registrosRecargasRouter.post("/", async (req, res, next) => {
  try {
    const body = registroSchema.parse(req.body);
    if (!esUrlDeBucket(body.comprobanteUrl)) {
      res.status(422).json({ error: "Comprobante inválido" });
      return;
    }

    const giroOtro = body.giro === GIRO_OTRO ? body.giroOtro : null;

    const registro = await conPublicCodeUnico(
      (publicCode) =>
        prisma.registroRecargas.create({
          data: {
            publicCode,
            nombreCompleto: body.nombreCompleto,
            email: body.email,
            telefono: body.telefono,
            nombreNegocio: body.nombreNegocio,
            giro: body.giro,
            giroOtro,
            comprobante: body.comprobanteUrl,
          },
        }),
      5,
      PUBLIC_CODE_PREFIX_RECARGAS
    );

    // Fire-and-forget: un error de correo no revierte el registro ya guardado.
    sendRegistroRecargasRecibido({
      folio: registro.publicCode,
      to: registro.email,
      nombre: registro.nombreCompleto,
      nombreNegocio: registro.nombreNegocio,
    }).catch((err) => console.error("Error enviando correo RegistroRecargasRecibido:", err));

    sendNuevoRegistroRecargas({
      registroId: registro.id,
      folio: registro.publicCode,
      nombreCompleto: registro.nombreCompleto,
      email: registro.email,
      telefono: registro.telefono,
      nombreNegocio: registro.nombreNegocio,
      giro: etiquetaGiro(registro.giro, registro.giroOtro),
      montoMinimo: formatMonto(montoMinimoRegistro()),
      comprobanteUrl: registro.comprobante,
    }).catch((err) => console.error("Error enviando correo NuevoRegistroRecargas:", err));

    res.status(201).json({ ok: true, publicCode: registro.publicCode });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: zodError(err) });
      return;
    }
    next(err);
  }
});
