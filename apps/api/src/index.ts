import "dotenv/config";
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { logger } from "./lib/logger.js";
import { validateStripeEnv } from "./lib/env.js";
import { planesRouter } from "./routes/planes.js";
import { leadsRouter } from "./routes/leads.js";
import { cuentasRouter } from "./routes/cuentas.js";
import { solicitudesRouter } from "./routes/solicitudes.js";
import { stripeWebhookRouter } from "./routes/stripeWebhook.js";
import { authRouter } from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";
import { adminSolicitudesRouter } from "./routes/admin/solicitudes.js";
import { adminPlanesRouter } from "./routes/admin/planes.js";
import { adminCuentasRouter } from "./routes/admin/cuentas.js";
import { adminReportesRouter } from "./routes/admin/reportes.js";

validateStripeEnv();

const app = express();
const PORT = process.env.PORT ?? 3001;

// Necesario para que req.ip refleje la IP real del cliente detrás del proxy
// de Railway, no la del proxy — se usa como evidencia de contracargo en el
// flujo de Stripe.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.WEB_URL ?? "http://localhost:5173",
    credentials: true,
  })
);

// El webhook de Stripe se monta ANTES de express.json(): necesita el body
// crudo (Buffer) para verificar la firma, no JSON ya parseado. Si esta ruta
// se mueve después de express.json(), la verificación de firma deja de
// funcionar (ver docs/ARCHITECTURE.md, prueba mínima §11.1 del checklist).
app.use("/api/stripe/webhook", stripeWebhookRouter);

app.use(express.json());
app.use(pinoHttp.default({ logger }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta en unos minutos." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiados intentos de inicio de sesión. Intenta en 15 minutos." },
});

// Rutas públicas
app.use("/api/planes", planesRouter);
app.use("/api/leads", publicLimiter, leadsRouter);
app.use("/api/cuentas-bancarias", cuentasRouter);
app.use("/api/solicitudes", publicLimiter, solicitudesRouter);
app.use("/api/auth", authLimiter, authRouter);

// Rutas protegidas — requireAuth se aplica a todo /api/admin/*
app.use("/api/admin", requireAuth);
app.use("/api/admin/solicitudes", adminSolicitudesRouter);
app.use("/api/admin/planes", adminPlanesRouter);
app.use("/api/admin/cuentas-bancarias", adminCuentasRouter);
app.use("/api/admin/reportes", adminReportesRouter);

// Error handler global
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error(err);
    const status = (err as { status?: number }).status ?? 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Error interno del servidor"
        : String((err as Error).message ?? err);
    res.status(status).json({ error: message });
  }
);

app.listen(PORT, () => {
  logger.info(`API corriendo en http://localhost:${PORT}`);
});
