export type CompaniaKey = "ATT" | "MOVISTAR" | "BAIT";

export interface AdminUser {
  id: number;
  email: string;
  nombre: string;
  rol: "PRO" | "GENERAL" | "RECARGAS";
}

export interface Plan {
  id: number;
  compania: CompaniaKey;
  precio: string;
  recarga: string;
  megas: number | null;
  dias: number | null;
  descripcion: string | null;
  activo: boolean;
  destacado: boolean;
  createdAt: string;
}

export interface HeroFormState {
  nombre: string;
  email: string;
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

export type MetodoPago = "TRANSFERENCIA" | "STRIPE";

export interface SolicitudResumen {
  id: number;
  publicCode: string;
  nombre: string;
  email: string;
  compania: CompaniaKey;
  estado: EstadoSolicitud;
  metodoPago: MetodoPago;
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
  telefono: string | null;
  ciudad: string | null;
  estadoMx: string | null;
  lada: string | null;
  // Nulo cuando metodoPago es STRIPE (no hay comprobante que revisar).
  comprobante: string | null;
  observacion: string | null;
  qrUrl: string | null;
  dn: string | null;
  historial: HistorialItem[];
}

export interface SolicitudPayload {
  nombre: string;
  email: string;
  ciudad?: string;
  estadoMx?: string;
  lada?: string;
  compania: CompaniaKey;
  planId: number;
  comprobanteUrl: string;
}

// Datos del cliente sin comprobante — usado para iniciar el checkout de
// Stripe (el comprobante no aplica a este método de pago).
export interface SolicitudStripeCheckoutPayload {
  nombre: string;
  email: string;
  ciudad?: string;
  estadoMx?: string;
  lada?: string;
  compania: CompaniaKey;
  planId: number;
}

// Respuesta mínima de /by-token y /consultar — deliberadamente no incluye el
// id interno (ver docs/ARCHITECTURE.md, addendum de Stripe).
export interface SolicitudPublica {
  publicCode: string;
  estado: EstadoSolicitud;
  nombre: string;
  compania: CompaniaKey;
  email: string;
}
