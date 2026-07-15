import { EstadoSolicitud } from "@prisma/client";

export const TRANSICIONES_VALIDAS: Record<EstadoSolicitud, EstadoSolicitud[]> = {
  RECIBIDA: ["REVISION_PAGO"],
  REVISION_PAGO: ["PAGO_VALIDADO", "PAGO_RECHAZADO"],
  PAGO_RECHAZADO: ["CANCELADA"],
  PAGO_VALIDADO: ["EN_ACTIVACION"],
  EN_ACTIVACION: ["QR_ENVIADO"],
  QR_ENVIADO: ["ACTIVADA", "CANCELADA"],
  ACTIVADA: [],
  CANCELADA: [],
};

export function transicionValida(
  actual: EstadoSolicitud,
  nuevo: EstadoSolicitud
): boolean {
  return TRANSICIONES_VALIDAS[actual].includes(nuevo);
}
