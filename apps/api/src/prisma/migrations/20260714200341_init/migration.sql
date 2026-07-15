-- CreateEnum
CREATE TYPE "Compania" AS ENUM ('ATT', 'MOVISTAR', 'BAIT');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('RECIBIDA', 'REVISION_PAGO', 'PAGO_RECHAZADO', 'PAGO_VALIDADO', 'EN_ACTIVACION', 'QR_ENVIADO', 'ACTIVADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "RolAdmin" AS ENUM ('PRO', 'GENERAL');

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "compania" "Compania" NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "recarga" DECIMAL(10,2) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "ciudad" TEXT,
    "estadoMx" TEXT,
    "lada" TEXT,
    "compania" "Compania" NOT NULL,
    "planId" INTEGER NOT NULL,
    "comprobante" TEXT NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'RECIBIDA',
    "observacion" TEXT,
    "qrUrl" TEXT,
    "dn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialEstado" (
    "id" SERIAL NOT NULL,
    "solicitudId" INTEGER NOT NULL,
    "estadoAnterior" "EstadoSolicitud" NOT NULL,
    "estadoNuevo" "EstadoSolicitud" NOT NULL,
    "adminId" INTEGER,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialEstado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuentaBancaria" (
    "id" SERIAL NOT NULL,
    "banco" TEXT NOT NULL,
    "titular" TEXT NOT NULL,
    "cuenta" TEXT,
    "clabe" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CuentaBancaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "aceptoTerminos" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolAdmin" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstado" ADD CONSTRAINT "HistorialEstado_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstado" ADD CONSTRAINT "HistorialEstado_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
