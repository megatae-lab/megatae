import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const cuentasRouter = Router();

// Solo cuentas de eSIM. Las de recargas se sirven en
// GET /api/registros-recargas/config y nunca deben aparecer en el checkout
// de eSIM.
cuentasRouter.get("/", async (_req, res, next) => {
  try {
    const cuentas = await prisma.cuentaBancaria.findMany({
      where: { activo: true, destino: "ESIM" },
      orderBy: { orden: "asc" },
      select: { id: true, banco: true, titular: true, cuenta: true, clabe: true },
    });
    res.json(cuentas);
  } catch (err) {
    next(err);
  }
});
