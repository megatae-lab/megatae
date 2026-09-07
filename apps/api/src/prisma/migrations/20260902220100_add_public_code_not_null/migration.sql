-- Paso 3 de 3 de la migración de publicCode. Solo debe aplicarse en un
-- ambiente DESPUÉS de correr `pnpm db:backfill-public-code` ahí — si queda
-- alguna Solicitud con publicCode nulo, esta migración falla (a propósito:
-- es preferible que falle a que se aplique con datos incompletos).
ALTER TABLE "Solicitud" ALTER COLUMN "publicCode" SET NOT NULL;
