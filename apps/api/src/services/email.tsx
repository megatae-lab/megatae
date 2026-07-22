import { Resend } from "resend";
import { render } from "@react-email/render";
import { SolicitudRecibida } from "../emails/SolicitudRecibida.js";
import { PagoRechazado } from "../emails/PagoRechazado.js";
import { QrEnviado } from "../emails/QrEnviado.js";
import { RecordatorioActivacion } from "../emails/RecordatorioActivacion.js";
import { FueraDeHorario } from "../emails/FueraDeHorario.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "no-reply@megatae.mx";
const logoUrl = process.env.WEB_URL ? `${process.env.WEB_URL}/assets/logo-megatae.png` : undefined;

export function isWithinBusinessHours(): boolean {
  const now = new Date();
  const mxDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const day = mxDate.getDay(); // 0=domingo, 1=lunes ... 6=sábado
  const hour = mxDate.getHours();
  if (day === 0) return hour >= 9 && hour < 23;
  return hour >= 8 && hour < 23;
}

export async function sendFueraDeHorario(opts: { to: string; nombre: string }) {
  const html = await render(<FueraDeHorario nombre={opts.nombre} logoUrl={logoUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: "Tu solicitud fue recibida — te atendemos en horario laboral",
    html,
  });
}

export async function sendPagoRechazado(opts: {
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
  to: string;
  nombre: string;
  compania: string;
  precio: string;
  recarga: string;
}) {
  const html = await render(<SolicitudRecibida {...opts} logoUrl={logoUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Tu solicitud de eSIM ${opts.compania} fue recibida`,
    html,
  });
}

export async function sendQrEnviado(opts: {
  to: string;
  nombre: string;
  compania: string;
  dn?: string;
  qrUrl: string;
}) {
  const videoUrl = process.env.VIDEO_TUTORIAL_URL || undefined;
  const html = await render(<QrEnviado {...opts} videoUrl={videoUrl} logoUrl={logoUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `¡Tu eSIM ${opts.compania} está lista! Aquí está tu QR`,
    html,
  });
}

export async function sendRecordatorioActivacion(opts: {
  to: string;
  nombre: string;
  compania: string;
}) {
  const html = await render(<RecordatorioActivacion nombre={opts.nombre} compania={opts.compania} logoUrl={logoUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Acción requerida: completa tu registro LMTR — eSIM ${opts.compania}`,
    html,
  });
}
