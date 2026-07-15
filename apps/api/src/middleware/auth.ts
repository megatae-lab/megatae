import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export interface AdminPayload {
  id: number;
  email: string;
  nombre: string;
  rol: "PRO" | "GENERAL";
}

export interface AuthRequest extends Request {
  admin?: AdminPayload;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminPayload;
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function requirePro(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.admin?.rol !== "PRO") {
    res.status(403).json({ error: "Acceso restringido a admin PRO" });
    return;
  }
  next();
}
