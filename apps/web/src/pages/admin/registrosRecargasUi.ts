import type { EstadoRegistro } from "../../types.js";

// Etiquetas y colores compartidos entre la cola y el detalle de registros de
// recargas (mismo lenguaje visual que la cola de eSIM).

export const ESTADO_REGISTRO_LABEL: Record<EstadoRegistro, string> = {
  RECIBIDO: "Nuevos",
  REVISION_PAGO: "En revisión",
  PAGO_RECHAZADO: "Rechazados",
  PAGO_VALIDADO: "Pago validado",
  CREDENCIALES_ENVIADAS: "Credenciales enviadas",
  CANCELADO: "Cancelados",
};

export const ESTADO_REGISTRO_COLOR: Record<EstadoRegistro, string> = {
  RECIBIDO: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  REVISION_PAGO: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  PAGO_RECHAZADO: "bg-red-500/20 text-red-300 border-red-500/30",
  PAGO_VALIDADO: "bg-green-500/20 text-green-300 border-green-500/30",
  CREDENCIALES_ENVIADAS: "bg-brand/20 text-brand-light border-brand/30",
  CANCELADO: "bg-white/5 text-white/30 border-white/10",
};

export const ESTADOS_REGISTRO_ORDEN: EstadoRegistro[] = [
  "RECIBIDO",
  "REVISION_PAGO",
  "PAGO_RECHAZADO",
  "PAGO_VALIDADO",
  "CREDENCIALES_ENVIADAS",
  "CANCELADO",
];

export const ROLES_RECARGAS = ["PRO", "RECARGAS"] as const;

export function puedeVerRecargas(rol: string | undefined): boolean {
  return !!rol && (ROLES_RECARGAS as readonly string[]).includes(rol);
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "Hace menos de 1h";
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

export function masde24h(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > 24 * 3_600_000;
}
