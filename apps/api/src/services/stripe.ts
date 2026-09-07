import Stripe from "stripe";

// Construcción perezosa a propósito: si esto se instanciara al importar el
// módulo (nivel superior), correría durante la fase de resolución de imports
// de ESM — ANTES de que validateStripeEnv() se ejecute en index.ts — y el
// proceso truena con el error crudo del SDK de Stripe en vez del mensaje
// claro de env.ts. getStripe() se llama solo dentro de handlers de rutas,
// que corren después de que el servidor ya arrancó (y ya validó el entorno).
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    // apiVersion fijo explícitamente (§1 del checklist) — así una
    // actualización de cuenta en el dashboard de Stripe no cambia el shape
    // de los eventos que recibe este backend sin que el código lo decida.
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-08-26.dahlia",
    });
  }
  return _stripe;
}

export function precioACentavos(precio: { toString(): string }): number {
  // Plan.precio es Decimal(10,2) — pasar por string evita errores de
  // redondeo de punto flotante al convertir a centavos.
  return Math.round(Number(precio.toString()) * 100);
}
