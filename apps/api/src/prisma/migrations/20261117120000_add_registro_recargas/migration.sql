-- Módulo: registro de negocios para recargas (docs/ARCHITECTURE.md, sección 17).
-- Sin backfill: "destino" tiene default ESIM (las cuentas existentes siguen
-- siendo de eSIM) y las tablas nuevas empiezan vacías.

-- CreateEnum
CREATE TYPE "DestinoCuenta" AS ENUM ('ESIM', 'RECARGAS');

-- CreateEnum
CREATE TYPE "EstadoRegistro" AS ENUM ('RECIBIDO', 'REVISION_PAGO', 'PAGO_RECHAZADO', 'PAGO_VALIDADO', 'CREDENCIALES_ENVIADAS', 'CANCELADO');

-- AlterTable
ALTER TABLE "CuentaBancaria" ADD COLUMN "destino" "DestinoCuenta" NOT NULL DEFAULT 'ESIM';

-- CreateTable
CREATE TABLE "RegistroRecargas" (
    "id" SERIAL NOT NULL,
    "publicCode" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "nombreNegocio" TEXT NOT NULL,
    "giro" TEXT NOT NULL,
    "giroOtro" TEXT,
    "comprobante" TEXT NOT NULL,
    "montoValidado" DECIMAL(10,2),
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'RECIBIDO',
    "observacion" TEXT,
    "usuarioPlataforma" TEXT,
    "credencialesEnviadasAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroRecargas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialRegistroRecargas" (
    "id" SERIAL NOT NULL,
    "registroId" INTEGER NOT NULL,
    "estadoAnterior" "EstadoRegistro" NOT NULL,
    "estadoNuevo" "EstadoRegistro" NOT NULL,
    "adminId" INTEGER,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialRegistroRecargas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistroRecargas_publicCode_key" ON "RegistroRecargas"("publicCode");

-- CreateIndex
CREATE INDEX "RegistroRecargas_estado_idx" ON "RegistroRecargas"("estado");

-- CreateIndex
CREATE INDEX "HistorialRegistroRecargas_registroId_idx" ON "HistorialRegistroRecargas"("registroId");

-- AddForeignKey
ALTER TABLE "HistorialRegistroRecargas" ADD CONSTRAINT "HistorialRegistroRecargas_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "RegistroRecargas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialRegistroRecargas" ADD CONSTRAINT "HistorialRegistroRecargas_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
