import { Router } from "express";
import { z } from "zod";
import { Compania } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { requirePro } from "../../middleware/auth.js";
import type { AuthRequest } from "../../middleware/auth.js";

export const adminPlanesRouter = Router();

adminPlanesRouter.get("/", async (_req, res, next) => {
  try {
    const planes = await prisma.plan.findMany({
      orderBy: [{ compania: "asc" }, { precio: "asc" }],
    });
    res.json(planes);
  } catch (err) {
    next(err);
  }
});

const planCreateSchema = z.object({
  compania: z.nativeEnum(Compania),
  precio: z.number().positive("El precio debe ser positivo"),
  recarga: z.number().positive("La recarga debe ser positiva"),
  descripcion: z.string().optional(),
});

adminPlanesRouter.post("/", requirePro, async (req: AuthRequest, res, next) => {
  try {
    const data = planCreateSchema.parse(req.body);
    const plan = await prisma.plan.create({ data });
    res.status(201).json(plan);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});

const planUpdateSchema = z.object({
  precio: z.number().positive("El precio debe ser positivo").optional(),
  recarga: z.number().positive("La recarga debe ser positiva").optional(),
  descripcion: z.string().nullable().optional(),
  activo: z.boolean().optional(),
  destacado: z.boolean().optional(),
});

adminPlanesRouter.patch("/:id", requirePro, async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

    const data = planUpdateSchema.parse(req.body);
    const plan = await prisma.plan.update({ where: { id }, data });
    res.json(plan);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});
