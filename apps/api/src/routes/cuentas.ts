import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const cuentasRouter = Router();

cuentasRouter.get("/", async (_req, res, next) => {
  try {
    const cuentas = await prisma.cuentaBancaria.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      select: { id: true, banco: true, titular: true, cuenta: true, clabe: true },
    });
    res.json(cuentas);
  } catch (err) {
    next(err);
  }
});
