import { randomBytes, randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";

// Alfabeto sin caracteres ambiguos (sin 0/O, 1/I/L) para que el folio se
// pueda leer y transcribir a mano sin errores.
const PUBLIC_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const PUBLIC_CODE_LENGTH = 10;
const PUBLIC_CODE_PREFIX = "MT-";

export function generatePublicCode(): string {
  let code = "";
  for (let i = 0; i < PUBLIC_CODE_LENGTH; i++) {
    code += PUBLIC_CODE_ALPHABET[randomInt(PUBLIC_CODE_ALPHABET.length)];
  }
  return `${PUBLIC_CODE_PREFIX}${code}`;
}

// Token opaco de 32 bytes (256 bits) — uso único: aterrizaje en /gracias
// justo después del redirect de Stripe. No es para seguimiento de largo plazo.
export function generateAccessToken(): string {
  return randomBytes(32).toString("hex");
}

export const ACCESS_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function esColisionDeCampo(err: unknown, campo: string): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    ((err.meta?.target as string[] | undefined)?.includes(campo) ?? false)
  );
}

// Reintenta `fn` con un publicCode nuevo si la inserción choca contra el
// constraint único (colisión, extremadamente improbable con este alfabeto,
// pero el código no debe asumir que nunca pasa).
export async function conPublicCodeUnico<T>(
  fn: (publicCode: string) => Promise<T>,
  intentos = 5
): Promise<T> {
  for (let intento = 0; intento < intentos; intento++) {
    try {
      return await fn(generatePublicCode());
    } catch (err) {
      if (esColisionDeCampo(err, "publicCode") && intento < intentos - 1) continue;
      throw err;
    }
  }
  throw new Error("No se pudo generar un publicCode único");
}
