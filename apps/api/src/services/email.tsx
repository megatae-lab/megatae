import { Resend } from "resend";
import { render } from "@react-email/render";
import { SolicitudRecibida } from "../emails/SolicitudRecibida.js";
import { PagoRechazado } from "../emails/PagoRechazado.js";
import { QrEnviado } from "../emails/QrEnviado.js";
import { RecordatorioActivacion } from "../emails/RecordatorioActivacion.js";
import { FueraDeHorario } from "../emails/FueraDeHorario.js";
import { NuevaOrden } from "../emails/NuevaOrden.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "no-reply@megatae.mx";
const assetsBaseUrl = process.env.R2_PUBLIC_URL ? `${process.env.R2_PUBLIC_URL}/assets` : undefined;
const logoUrl = assetsBaseUrl ? `${assetsBaseUrl}/logo-megatae.png` : undefined;
const iconUrl = assetsBaseUrl ? `${assetsBaseUrl}/logo.png` : undefined;

const COMPANY_LOGO_FILE: Record<string, string> = {
  ATT: "logo-att.png",
  MOVISTAR: "logo-movistar.png",
  BAIT: "logo-bait.png",
};

export function isWithinBusinessHours(): boolean {
  const now = new Date();
  const mxDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const hour = mxDate.getHours();
  return hour >= 9 && hour < 23;
}

export async function sendFueraDeHorario(opts: { to: string; nombre: string; folio: string }) {
  const html = await render(<FueraDeHorario folio={opts.folio} nombre={opts.nombre} iconUrl={iconUrl} assetsBaseUrl={assetsBaseUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: "Tu solicitud fue recibida — te atendemos en horario laboral",
    html,
  });
}

export async function sendPagoRechazado(opts: {
  folio: string;
  to: string;
  nombre: string;
  compania: string;
  observacion: string;
}) {
  const html = await render(<PagoRechazado {...opts} logoUrl={logoUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Tu comprobante de pago no pudo ser verificado — eSIM ${opts.compania}`,
    html,
  });
}

export async function sendSolicitudRecibida(opts: {
  folio: string;
  to: string;
  nombre: string;
  compania: string;
  companiaCode: "ATT" | "MOVISTAR" | "BAIT";
  precio: string;
  recarga: string;
}) {
  const companiaLogoUrl = assetsBaseUrl
    ? `${assetsBaseUrl}/${COMPANY_LOGO_FILE[opts.companiaCode]}`
    : undefined;
  const html = await render(<SolicitudRecibida {...opts} iconUrl={iconUrl} companiaLogoUrl={companiaLogoUrl} assetsBaseUrl={assetsBaseUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Tu solicitud de eSIM ${opts.compania} fue recibida`,
    html,
  });
}

export async function sendQrEnviado(opts: {
  folio: string;
  to: string;
  nombre: string;
  compania: string;
  companiaCode: "ATT" | "MOVISTAR" | "BAIT";
  precio: string;
  recarga: string;
  dn?: string;
  qrUrl: string;
}) {
  const companiaLogoUrl = assetsBaseUrl
    ? `${assetsBaseUrl}/${COMPANY_LOGO_FILE[opts.companiaCode]}`
    : undefined;
  const html = await render(<QrEnviado {...opts} iconUrl={iconUrl} companiaLogoUrl={companiaLogoUrl} assetsBaseUrl={assetsBaseUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `¡Tu eSIM ${opts.compania} está lista! Aquí está tu QR`,
    html,
  });
}

export async function sendRecordatorioActivacion(opts: {
  folio: string;
  to: string;
  nombre: string;
  compania: string;
  companiaCode: "ATT" | "MOVISTAR" | "BAIT";
  dn?: string;
}) {
  const companiaLogoUrl = assetsBaseUrl
    ? `${assetsBaseUrl}/${COMPANY_LOGO_FILE[opts.companiaCode]}`
    : undefined;
  const html = await render(<RecordatorioActivacion {...opts} iconUrl={iconUrl} companiaLogoUrl={companiaLogoUrl} assetsBaseUrl={assetsBaseUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Acción requerida: completa tu registro LMTR — eSIM ${opts.compania}`,
    html,
  });
}

// Destinatarios internos de la alerta de orden nueva, separados por comas en
// NOTIFICACION_NUEVA_ORDEN_EMAILS. Vive en el entorno (no en código) para
// poder cambiar la lista desde Railway sin tocar el repo. Si está vacía, la
// alerta simplemente no se envía.
function destinatariosNuevaOrden(): string[] {
  return (process.env.NOTIFICACION_NUEVA_ORDEN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export async function sendNuevaOrden(opts: {
  solicitudId: number;
  folio: string;
  metodoPago: "TRANSFERENCIA" | "STRIPE";
  nombre: string;
  email: string;
  compania: string;
  lada?: string | null;
  precio: string;
  recarga: string;
  comprobanteUrl?: string | null;
}) {
  const to = destinatariosNuevaOrden();
  if (to.length === 0) return;

  const adminUrl = process.env.WEB_URL ? `${process.env.WEB_URL}/admin/solicitudes/${opts.solicitudId}` : undefined;
  const html = await render(<NuevaOrden {...opts} adminUrl={adminUrl} />);
  const metodo = opts.metodoPago === "STRIPE" ? "Tarjeta" : "Transferencia";
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Nueva orden ${opts.folio} — eSIM ${opts.compania} $${opts.precio} (${metodo})`,
    html,
  });
}
