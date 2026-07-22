export type CompaniaKey = "ATT" | "MOVISTAR" | "BAIT";

export interface AdminUser {
  id: number;
  email: string;
  nombre: string;
  rol: "PRO" | "GENERAL";
}

export interface Plan {
  id: number;
  compania: CompaniaKey;
  precio: string;
  recarga: string;
  descripcion: string | null;
  activo: boolean;
  destacado: boolean;
  createdAt: string;
}

export interface HeroFormState {
  nombre: string;
  email: string;
  telefono: string;
  compania: CompaniaKey | "";
}

export interface CuentaBancaria {
  id: number;
  banco: string;
  titular: string;
  cuenta: string | null;
  clabe: string | null;
  activo: boolean;
  orden: number;
}

export type EstadoSolicitud =
  | "RECIBIDA"
  | "REVISION_PAGO"
  | "PAGO_RECHAZADO"
  | "PAGO_VALIDADO"
  | "EN_ACTIVACION"
  | "QR_ENVIADO"
  | "ACTIVADA"
  | "CANCELADA";

export interface SolicitudResumen {
  id: number;
  nombre: string;
  email: string;
  compania: CompaniaKey;
  estado: EstadoSolicitud;
  createdAt: string;
  updatedAt: string;
  plan: { precio: string; recarga: string };
}

export interface HistorialItem {
  id: number;
  estadoAnterior: EstadoSolicitud;
  estadoNuevo: EstadoSolicitud;
  observacion: string | null;
  createdAt: string;
  admin: { nombre: string } | null;
}

export interface SolicitudDetalle extends SolicitudResumen {
  telefono: string;
  ciudad: string | null;
  estadoMx: string | null;
  lada: string | null;
  comprobante: string;
  observacion: string | null;
  qrUrl: string | null;
  dn: string | null;
  historial: HistorialItem[];
}

export interface SolicitudPayload {
  nombre: string;
  email: string;
  telefono: string;
  ciudad?: string;
  estadoMx?: string;
  lada?: string;
  compania: CompaniaKey;
  planId: number;
  comprobanteUrl: string;
}
