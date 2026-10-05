import "dotenv/config";

// Las pruebas de webhook firman y verifican localmente (no llaman a la API
// real de Stripe), así que si apps/api/.env todavía no tiene llaves reales
// configuradas, se usa un relleno — nunca se manda una request de red con
// este valor.
process.env.STRIPE_SECRET_KEY ||= "sk_test_vitest_placeholder";
process.env.STRIPE_WEBHOOK_SECRET ||= "whsec_vitest_placeholder";

// Las pruebas no deben disparar la alerta interna de orden nueva a los
// correos reales del equipo.
process.env.NOTIFICACION_NUEVA_ORDEN_EMAILS = "";
