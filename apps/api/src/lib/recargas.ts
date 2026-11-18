// Configuración del módulo de registro de negocios para recargas.

const MONTO_MINIMO_DEFAULT = 500;

// Depósito mínimo en MXN. Vive en la API (no en la web) para poder cambiarlo
// desde Railway sin recompilar el frontend, que lo lee de
// GET /api/registros-recargas/config.
export function montoMinimoRegistro(): number {
  const raw = Number(process.env.MONTO_MINIMO_REGISTRO_RECARGAS);
  return Number.isFinite(raw) && raw > 0 ? raw : MONTO_MINIMO_DEFAULT;
}

export function formatMonto(n: number): string {
  return n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
