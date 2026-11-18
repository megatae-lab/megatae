import { EstadoRegistro, EstadoSolicitud } from "@prisma/client";

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

// Registro de negocios para recargas. PAGO_VALIDADO → CREDENCIALES_ENVIADAS
// no está aquí a propósito: solo ocurre vía POST /:id/credenciales, que es el
// único lugar donde se envía el correo con usuario y contraseña.
export const TRANSICIONES_REGISTRO: Record<EstadoRegistro, EstadoRegistro[]> = {
  RECIBIDO: ["REVISION_PAGO"],
  REVISION_PAGO: ["PAGO_VALIDADO", "PAGO_RECHAZADO"],
  PAGO_RECHAZADO: ["CANCELADO"],
  PAGO_VALIDADO: [],
  CREDENCIALES_ENVIADAS: [],
  CANCELADO: [],
};

export function transicionRegistroValida(
  actual: EstadoRegistro,
  nuevo: EstadoRegistro
): boolean {
  return TRANSICIONES_REGISTRO[actual].includes(nuevo);
}
