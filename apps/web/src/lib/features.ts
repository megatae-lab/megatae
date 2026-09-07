// Flags de features controladas por variable de entorno — apagar aquí no
// borra el código, solo lo oculta del front. Ver docs/PROGRESS.md.

// Método de pago por transferencia bancaria (cuentas + upload de
// comprobante). Si se apaga, también se oculta la pestaña "Cuentas
// bancarias" en /admin/configuracion — no tiene sentido administrar cuentas
// que no se muestran en ningún lado.
export const TRANSFERENCIA_HABILITADA = import.meta.env.VITE_TRANSFERENCIA_HABILITADA === "true";
