import { Router } from "express";
import { z } from "zod";
import ExcelJS from "exceljs";
import { EstadoSolicitud, Compania } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type { AuthRequest } from "../../middleware/auth.js";

export const adminReportesRouter = Router();

const ESTADOS_POR_ROL: Record<string, EstadoSolicitud[]> = {
  PRO: ["RECIBIDA", "REVISION_PAGO", "PAGO_RECHAZADO", "PAGO_VALIDADO", "EN_ACTIVACION", "QR_ENVIADO", "ACTIVADA", "CANCELADA"],
  GENERAL: ["RECIBIDA", "REVISION_PAGO", "PAGO_RECHAZADO", "PAGO_VALIDADO", "EN_ACTIVACION"],
  RECARGAS: ["QR_ENVIADO", "ACTIVADA"],
};

const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  RECIBIDA: "Nueva",
  REVISION_PAGO: "En revisión",
  PAGO_RECHAZADO: "Pago rechazado",
  PAGO_VALIDADO: "Pago validado",
  EN_ACTIVACION: "Activando",
  QR_ENVIADO: "QR enviado",
  ACTIVADA: "Activada",
  CANCELADA: "Cancelada",
};

const COMPANIA_LABEL: Record<Compania, string> = {
  ATT: "AT&T",
  MOVISTAR: "Movistar",
  BAIT: "Bait",
};

const querySchema = z.object({
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
  compania: z.nativeEnum(Compania).optional(),
  estado: z.nativeEnum(EstadoSolicitud).optional(),
});

adminReportesRouter.get("/solicitudes.xlsx", async (req: AuthRequest, res, next) => {
  try {
    const { desde, hasta, compania, estado } = querySchema.parse(req.query);

    const estadosPermitidos = ESTADOS_POR_ROL[req.admin!.rol] ?? [];
    if (estado && !estadosPermitidos.includes(estado)) {
      res.status(403).json({ error: "No tienes acceso a solicitudes en ese estado" });
      return;
    }
    const estados = estado ? [estado] : estadosPermitidos;

    const solicitudes = await prisma.solicitud.findMany({
      where: {
        estado: { in: estados },
        ...(compania ? { compania } : {}),
        ...(desde || hasta
          ? {
              createdAt: {
                ...(desde ? { gte: new Date(desde) } : {}),
                ...(hasta ? { lte: new Date(hasta) } : {}),
              },
            }
          : {}),
      },
      include: { plan: { select: { precio: true, recarga: true, megas: true, dias: true } } },
      orderBy: { createdAt: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Solicitudes");

    sheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Nombre", key: "nombre", width: 26 },
      { header: "Email", key: "email", width: 28 },
      { header: "Teléfono", key: "telefono", width: 16 },
      { header: "Estado (MX)", key: "estadoMx", width: 16 },
      { header: "Compañía", key: "compania", width: 12 },
      { header: "Plan", key: "plan", width: 16 },
      { header: "Precio (MXN)", key: "precio", width: 14 },
      { header: "Recarga (MXN)", key: "recarga", width: 14 },
      { header: "Número asignado", key: "dn", width: 18 },
      { header: "Estado solicitud", key: "estado", width: 16 },
      { header: "Observación", key: "observacion", width: 30 },
      { header: "Fecha de solicitud", key: "createdAt", width: 18 },
      { header: "Última actualización", key: "updatedAt", width: 18 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const s of solicitudes) {
      sheet.addRow({
        id: s.id,
        nombre: s.nombre,
        email: s.email,
        telefono: s.telefono,
        estadoMx: s.estadoMx ?? "",
        compania: COMPANIA_LABEL[s.compania] ?? s.compania,
        plan: s.plan.megas != null && s.plan.dias != null ? `${s.plan.megas} GB / ${s.plan.dias} días` : "",
        precio: Number(s.plan.precio),
        recarga: Number(s.plan.recarga),
        dn: s.dn ?? "",
        estado: ESTADO_LABEL[s.estado] ?? s.estado,
        observacion: s.observacion ?? "",
        createdAt: s.createdAt.toISOString().slice(0, 16).replace("T", " "),
        updatedAt: s.updatedAt.toISOString().slice(0, 16).replace("T", " "),
      });
    }

    const fecha = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="megatae-solicitudes-${fecha}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Filtros inválidos" });
      return;
    }
    next(err);
  }
});
