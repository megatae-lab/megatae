import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requirePro } from "../../middleware/auth.js";
import type { AuthRequest } from "../../middleware/auth.js";

export const adminCuentasRouter = Router();

adminCuentasRouter.get("/", async (_req, res, next) => {
  try {
    const cuentas = await prisma.cuentaBancaria.findMany({
      orderBy: { orden: "asc" },
    });
    res.json(cuentas);
  } catch (err) {
    next(err);
  }
});

const cuentaCreateSchema = z.object({
  banco: z.string().min(1, "El banco es requerido"),
  titular: z.string().min(1, "El titular es requerido"),
  cuenta: z.string().optional(),
  clabe: z.string().optional(),
});

adminCuentasRouter.post("/", requirePro, async (req: AuthRequest, res, next) => {
  try {
    const data = cuentaCreateSchema.parse(req.body);
    const last = await prisma.cuentaBancaria.findFirst({ orderBy: { orden: "desc" } });
    const cuenta = await prisma.cuentaBancaria.create({
      data: { ...data, orden: (last?.orden ?? -1) + 1 },
    });
    res.status(201).json(cuenta);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});

// POST antes que PATCH /:id para que "reorder" no sea tratado como ID
adminCuentasRouter.post("/reorder", requirePro, async (req: AuthRequest, res, next) => {
  try {
    const { ids } = z.object({ ids: z.array(z.number()) }).parse(req.body);
    await prisma.$transaction(
      ids.map((id, idx) =>
        prisma.cuentaBancaria.update({ where: { id }, data: { orden: idx } })
      )
    );
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});

const cuentaUpdateSchema = z.object({
  banco: z.string().min(1).optional(),
  titular: z.string().min(1).optional(),
  cuenta: z.string().nullable().optional(),
  clabe: z.string().nullable().optional(),
  activo: z.boolean().optional(),
});

adminCuentasRouter.patch("/:id", requirePro, async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const data = cuentaUpdateSchema.parse(req.body);
    const cuenta = await prisma.cuentaBancaria.update({ where: { id }, data });
    res.json(cuenta);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});
