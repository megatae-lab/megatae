import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const leadsRouter = Router();

const schema = z.object({
  email: z.string().email(),
  aceptoTerminos: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos" }),
  }),
});

leadsRouter.post("/", async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    await prisma.lead.create({ data });
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: err.errors[0]?.message ?? "Datos inválidos" });
      return;
    }
    next(err);
  }
});
