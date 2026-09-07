// Pruebas mínimas del §11 de docs/STRIPE_SECURITY_CHECKLIST.md. Corren
// contra la BD local de desarrollo (misma DATABASE_URL que `pnpm dev`) y NO
// llaman a la API real de Stripe — la firma se genera y verifica localmente
// con el mismo STRIPE_WEBHOOK_SECRET (ver src/test/setup.ts).
import { describe, it, expect, afterEach, afterAll } from "vitest";
import express from "express";
import request from "supertest";
import { prisma } from "../lib/prisma.js";
import { getStripe } from "../services/stripe.js";
import { stripeWebhookRouter } from "./stripeWebhook.js";

// Réplica de cómo se monta en index.ts: el webhook ANTES de express.json().
function appOrdenCorrecto() {
  const app = express();
  app.use("/api/stripe/webhook", stripeWebhookRouter);
  app.use(express.json());
  return app;
}

// Regresión intencional del §11.1: si alguien mueve express.json() antes del
// webhook en index.ts, la firma deja de poder verificarse porque el body ya
// llegó parseado como objeto, no como Buffer crudo.
function appOrdenRoto() {
  const app = express();
  app.use(express.json());
  app.use("/api/stripe/webhook", stripeWebhookRouter);
  return app;
}

function firmar(payload: string): string {
  return getStripe().webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
}

function construirEventoCheckoutCompletado(opts: {
  solicitudId: number;
  amountTotal: number;
  currency?: string;
  paymentStatus?: string;
  eventId?: string;
}): string {
  return JSON.stringify({
    id: opts.eventId ?? `evt_test_${Math.random().toString(36).slice(2)}`,
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_test_${Math.random().toString(36).slice(2)}`,
        object: "checkout.session",
        amount_total: opts.amountTotal,
        currency: opts.currency ?? "mxn",
        payment_status: opts.paymentStatus ?? "paid",
        metadata: { solicitudId: String(opts.solicitudId) },
      },
    },
  });
}

async function crearSolicitudDePrueba(precioCotizado: number) {
  const plan = await prisma.plan.findFirstOrThrow();
  return prisma.solicitud.create({
    data: {
      publicCode: `MT-TEST${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      nombre: "Test Webhook Stripe",
      email: `stripe-webhook-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      compania: plan.compania,
      planId: plan.id,
      metodoPago: "STRIPE",
      comprobante: null,
      precioCotizado,
      estado: "RECIBIDA",
    },
  });
}

const solicitudesCreadas: number[] = [];
const eventosCreados: string[] = [];

async function post(app: express.Express, payload: string, firma: string) {
  return request(app)
    .post("/api/stripe/webhook")
    .set("Content-Type", "application/json")
    .set("stripe-signature", firma)
    .send(payload);
}

afterEach(async () => {
  if (solicitudesCreadas.length > 0) {
    await prisma.historialEstado.deleteMany({ where: { solicitudId: { in: solicitudesCreadas } } });
    await prisma.solicitud.deleteMany({ where: { id: { in: solicitudesCreadas } } });
    solicitudesCreadas.length = 0;
  }
  if (eventosCreados.length > 0) {
    await prisma.stripeEvent.deleteMany({ where: { id: { in: eventosCreados } } });
    eventosCreados.length = 0;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Webhook de Stripe — pruebas mínimas del checklist (§11)", () => {
  it("§11.1 — express.json() antes de la ruta rompe la verificación de firma", async () => {
    const solicitud = await crearSolicitudDePrueba(10000);
    solicitudesCreadas.push(solicitud.id);
    const eventId = `evt_test_orden_${Date.now()}`;
    eventosCreados.push(eventId);
    const payload = construirEventoCheckoutCompletado({ solicitudId: solicitud.id, amountTotal: 10000, eventId });
    const firma = firmar(payload);

    const resRoto = await post(appOrdenRoto(), payload, firma);
    expect(resRoto.status).toBe(400);

    const resCorrecto = await post(appOrdenCorrecto(), payload, firma);
    expect(resCorrecto.status).toBe(200);
  });

  it("§11.2 — evento duplicado (mismo event.id) transiciona una sola vez", async () => {
    const solicitud = await crearSolicitudDePrueba(10000);
    solicitudesCreadas.push(solicitud.id);
    const eventId = `evt_test_dup_${Date.now()}`;
    eventosCreados.push(eventId);
    const payload = construirEventoCheckoutCompletado({ solicitudId: solicitud.id, amountTotal: 10000, eventId });
    const firma = firmar(payload);
    const app = appOrdenCorrecto();

    const primera = await post(app, payload, firma);
    const segunda = await post(app, payload, firma);
    expect(primera.status).toBe(200);
    expect(segunda.status).toBe(200);

    const actualizada = await prisma.solicitud.findUniqueOrThrow({ where: { id: solicitud.id } });
    expect(actualizada.estado).toBe("PAGO_VALIDADO");

    const historial = await prisma.historialEstado.findMany({
      where: { solicitudId: solicitud.id, estadoNuevo: "PAGO_VALIDADO" },
    });
    expect(historial).toHaveLength(1);
  });

  it("§11.3 — monto distinto a precioCotizado no avanza el estado", async () => {
    const solicitud = await crearSolicitudDePrueba(10000);
    solicitudesCreadas.push(solicitud.id);
    const eventId = `evt_test_monto_${Date.now()}`;
    eventosCreados.push(eventId);
    const payload = construirEventoCheckoutCompletado({ solicitudId: solicitud.id, amountTotal: 5000, eventId });
    const firma = firmar(payload);

    const res = await post(appOrdenCorrecto(), payload, firma);
    expect(res.status).toBe(200);

    const actualizada = await prisma.solicitud.findUniqueOrThrow({ where: { id: solicitud.id } });
    expect(actualizada.estado).toBe("RECIBIDA");
    expect(actualizada.observacion).toMatch(/Discrepancia de monto/);
  });

  it("§11.4 — payment_status distinto de 'paid' no avanza el estado", async () => {
    const solicitud = await crearSolicitudDePrueba(10000);
    solicitudesCreadas.push(solicitud.id);
    const eventId = `evt_test_unpaid_${Date.now()}`;
    eventosCreados.push(eventId);
    const payload = construirEventoCheckoutCompletado({
      solicitudId: solicitud.id,
      amountTotal: 10000,
      paymentStatus: "unpaid",
      eventId,
    });
    const firma = firmar(payload);

    const res = await post(appOrdenCorrecto(), payload, firma);
    expect(res.status).toBe(200);

    const actualizada = await prisma.solicitud.findUniqueOrThrow({ where: { id: solicitud.id } });
    expect(actualizada.estado).toBe("RECIBIDA");
  });
});
