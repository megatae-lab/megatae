import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({ where: { email } });

    // Misma respuesta para usuario inexistente o contraseña incorrecta
    // para no filtrar si el email existe
    if (!admin || !admin.activo) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const payload = {
      id: admin.id,
      email: admin.email,
      nombre: admin.nombre,
      rol: admin.rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? "8h") as jwt.SignOptions["expiresIn"],
    });

    res.json({ token, admin: payload });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: "Datos inválidos" });
      return;
    }
    next(err);
  }
});
