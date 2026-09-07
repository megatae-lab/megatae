// Validación de arranque para las variables de entorno de Stripe (§1 de
// docs/STRIPE_SECURITY_CHECKLIST.md). Se importa al inicio de index.ts para
// que el proceso falle temprano y con un mensaje claro, no a medio manejar
// un webhook.
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().min(1, "Falta STRIPE_SECRET_KEY"),
    STRIPE_WEBHOOK_SECRET: z.string().min(1, "Falta STRIPE_WEBHOOK_SECRET"),
    WEB_URL: z.string().url("WEB_URL debe ser una URL válida"),
  })
  .refine(
    (env) => !(env.NODE_ENV === "production" && env.STRIPE_SECRET_KEY.startsWith("sk_test_")),
    {
      message:
        "STRIPE_SECRET_KEY es una llave de test (sk_test_) pero NODE_ENV=production. " +
        "Revisa las variables de entorno antes de arrancar — esto es exactamente lo que " +
        "el checklist de salida a llaves live pide verificar.",
      path: ["STRIPE_SECRET_KEY"],
    }
  );

export function validateStripeEnv(): void {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const mensaje = result.error.errors.map((e) => `  - ${e.message}`).join("\n");
    // eslint-disable-next-line no-console
    console.error(`Configuración de entorno inválida:\n${mensaje}`);
    process.exit(1);
  }
}
