import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const planesRouter = Router();

planesRouter.get("/", async (_req, res, next) => {
  try {
    const planes = await prisma.plan.findMany({
      where: { activo: true },
      orderBy: [{ compania: "asc" }, { precio: "asc" }],
    });
    res.json(planes);
  } catch (err) {
    next(err);
  }
});
