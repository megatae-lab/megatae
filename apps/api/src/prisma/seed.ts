import { PrismaClient, Compania, RolAdmin } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Borra y recrea planes para que el seed sea idempotente
  await prisma.plan.deleteMany();
  await prisma.plan.createMany({
    data: [
      {
        compania: Compania.BAIT,
        precio: 70,
        recarga: 100,
        descripcion: "Activación inmediata · Sin SIM física · Conexión segura",
        activo: true,
      },
      {
        compania: Compania.ATT,
        precio: 70,
        recarga: 100,
        descripcion: "Activación inmediata · Sin SIM física · Conexión segura",
        activo: true,
      },
      {
        compania: Compania.ATT,
        precio: 150,
        recarga: 200,
        descripcion: "Activación inmediata · Sin SIM física · Conexión segura",
        activo: true,
      },
      {
        compania: Compania.MOVISTAR,
        precio: 70,
        recarga: 100,
        descripcion: "Activación inmediata · Sin SIM física · Conexión segura",
        activo: true,
      },
      {
        compania: Compania.MOVISTAR,
        precio: 150,
        recarga: 200,
        // Dato exacto pendiente de confirmar con el cliente — usar placeholder
        descripcion: "Activación inmediata · Sin SIM física · Conexión segura",
        activo: true,
      },
    ],
  });

  // Borra y recrea cuentas bancarias
  await prisma.cuentaBancaria.deleteMany();
  await prisma.cuentaBancaria.createMany({
    data: [
      {
        banco: "BBVA",
        titular: "MEGATAE GLOBAL SA DE CV",
        cuenta: "1234567890",
        clabe: "012345678901234567",
        activo: true,
        orden: 1,
      },
      {
        banco: "BANAMEX",
        titular: "MEGATAE GLOBAL SA DE CV",
        cuenta: "0987654321",
        clabe: "002345678901234560",
        activo: true,
        orden: 2,
      },
    ],
  });

  // Admin PRO — cambiar contraseña en producción
  const hashPro = await bcrypt.hash("Admin2024!", 12);
  await prisma.admin.upsert({
    where: { email: "admin@megatae.mx" },
    update: {},
    create: {
      email: "admin@megatae.mx",
      passwordHash: hashPro,
      nombre: "Admin Pro",
      rol: RolAdmin.PRO,
      activo: true,
    },
  });

  // Admin GENERAL de ejemplo — cambiar contraseña en producción
  const hashGeneral = await bcrypt.hash("Mesa2024!", 12);
  await prisma.admin.upsert({
    where: { email: "mesa@megatae.mx" },
    update: {},
    create: {
      email: "mesa@megatae.mx",
      passwordHash: hashGeneral,
      nombre: "Mesa de Control",
      rol: RolAdmin.GENERAL,
      activo: true,
    },
  });

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
