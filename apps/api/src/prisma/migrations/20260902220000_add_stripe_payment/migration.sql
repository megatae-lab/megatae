-- Paso 1 de 2 de la migración de publicCode: columna nullable, se backfillea
-- con `pnpm db:backfill-public-code` y se cierra a NOT NULL en la migración
-- siguiente (ver docs/ARCHITECTURE.md, addendum de Stripe).

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('TRANSFERENCIA', 'STRIPE');

-- AlterTable
ALTER TABLE "Solicitud" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "metodoPago" "MetodoPago" NOT NULL DEFAULT 'TRANSFERENCIA',
ADD COLUMN     "precioCotizado" INTEGER,
ADD COLUMN     "publicCode" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ADD COLUMN     "userAgent" TEXT,
ALTER COLUMN "comprobante" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_publicCode_key" ON "Solicitud"("publicCode");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_stripeSessionId_key" ON "Solicitud"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_accessToken_key" ON "Solicitud"("accessToken");
