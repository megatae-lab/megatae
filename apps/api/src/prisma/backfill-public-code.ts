// Paso 2 de 3 de la migración de publicCode (ver docs/ARCHITECTURE.md,
// addendum de Stripe). Genera un publicCode para cada Solicitud existente
// que todavía no tiene uno. Idempotente: correrlo dos veces no rompe nada,
// solo no toca las filas que ya tienen publicCode.
//
// Usa SQL crudo a propósito: este script corre contra un estado transitorio
// de la BD (después de la migración que agrega publicCode nullable, antes de
// la que la vuelve NOT NULL) que ya no coincide con schema.prisma tal como
// queda en el repo una vez cerrado el ciclo — el Prisma Client generado no
// permite consultar `publicCode: null` sobre un campo que el schema declara
// como requerido.
import { PrismaClient } from "@prisma/client";
import { generatePublicCode } from "../lib/tokens.js";

const prisma = new PrismaClient();

async function main() {
  const pendientes = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM "Solicitud" WHERE "publicCode" IS NULL
  `;

  console.log(`${pendientes.length} solicitudes sin publicCode.`);

  let actualizadas = 0;
  for (const { id } of pendientes) {
    let hecho = false;
    for (let intento = 0; intento < 5 && !hecho; intento++) {
      try {
        await prisma.$executeRaw`
          UPDATE "Solicitud" SET "publicCode" = ${generatePublicCode()} WHERE id = ${id}
        `;
        hecho = true;
        actualizadas++;
      } catch (err) {
        // Colisión de publicCode (extremadamente improbable) — reintenta con
        // un código nuevo. Cualquier otro error se propaga.
        const esColisionUnicidad =
          err instanceof Error && /unique constraint/i.test(err.message);
        if (!esColisionUnicidad || intento === 4) throw err;
      }
    }
  }

  console.log(`Backfill completado: ${actualizadas} solicitudes actualizadas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
