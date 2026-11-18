// Catálogo de giros para el registro de negocios de recargas. Vive en código
// (no en un enum de Postgres) para poder agregar o renombrar opciones sin
// migración: la columna guarda la clave y la API valida contra esta lista.
// El frontend recibe la lista desde GET /api/registros-recargas/config, así
// que agregar una opción aquí basta para que aparezca en el formulario.
//
// No borres claves que ya estén en uso: los registros existentes la
// seguirían mostrando sin etiqueta. Para retirar una opción, márcala con
// `activo: false` (deja de mostrarse en el formulario pero se sigue
// reconociendo en el panel).

export interface GiroNegocio {
  clave: string;
  etiqueta: string;
  activo: boolean;
}

export const GIROS_NEGOCIO: GiroNegocio[] = [
  { clave: "TIENDA_ABARROTES", etiqueta: "Tienda de abarrotes", activo: true },
  { clave: "MISCELANEA", etiqueta: "Miscelánea", activo: true },
  { clave: "FARMACIA", etiqueta: "Farmacia", activo: true },
  { clave: "PAPELERIA", etiqueta: "Papelería", activo: true },
  { clave: "FRUTERIA", etiqueta: "Frutería / verdulería", activo: true },
  { clave: "FERRETERIA", etiqueta: "Ferretería", activo: true },
  { clave: "CELULARES", etiqueta: "Tienda de celulares y accesorios", activo: true },
  { clave: "CIBERCAFE", etiqueta: "Cibercafé", activo: true },
  { clave: "ESTETICA", etiqueta: "Estética / barbería", activo: true },
  { clave: "OTRO", etiqueta: "Otro", activo: true },
];

export const GIRO_OTRO = "OTRO";

export function esGiroValido(clave: string): boolean {
  return GIROS_NEGOCIO.some((g) => g.clave === clave && g.activo);
}

export function etiquetaGiro(clave: string, giroOtro?: string | null): string {
  if (clave === GIRO_OTRO && giroOtro) return `Otro: ${giroOtro}`;
  return GIROS_NEGOCIO.find((g) => g.clave === clave)?.etiqueta ?? clave;
}
