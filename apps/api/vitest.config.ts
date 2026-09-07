import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 15000,
    // Pruebas de integración: corren contra la BD local de desarrollo
    // (DATABASE_URL de apps/api/.env), no contra producción — mismo criterio
    // que vaciar.ts y el resto de scripts de mantenimiento.
  },
});
