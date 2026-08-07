import { Resend } from "resend";
import { render } from "@react-email/render";
import { SolicitudRecibida } from "../emails/SolicitudRecibida.js";
import { PagoRechazado } from "../emails/PagoRechazado.js";
import { QrEnviado } from "../emails/QrEnviado.js";
import { RecordatorioActivacion } from "../emails/RecordatorioActivacion.js";
import { FueraDeHorario } from "../emails/FueraDeHorario.js";

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

export async function sendFueraDeHorario(opts: { to: string; nombre: string; folio: number }) {
  const html = await render(<FueraDeHorario folio={opts.folio} nombre={opts.nombre} iconUrl={iconUrl} assetsBaseUrl={assetsBaseUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: "Tu solicitud fue recibida — te atendemos en horario laboral",
    html,
  });
}

export async function sendPagoRechazado(opts: {
  folio: number;
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
  folio: number;
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
  folio: number;
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
  folio: number;
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
