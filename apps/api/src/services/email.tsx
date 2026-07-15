import { Resend } from "resend";
import { render } from "@react-email/render";
import { SolicitudRecibida } from "../emails/SolicitudRecibida.js";
import { PagoRechazado } from "../emails/PagoRechazado.js";
import { QrEnviado } from "../emails/QrEnviado.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "no-reply@megatae.mx";

export async function sendPagoRechazado(opts: {
  to: string;
  nombre: string;
  compania: string;
  observacion: string;
}) {
  const html = await render(<PagoRechazado {...opts} />);
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
  const html = await render(<SolicitudRecibida {...opts} />);
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
  dn: string;
  qrUrl: string;
}) {
  const videoUrl = process.env.VIDEO_TUTORIAL_URL || undefined;
  const html = await render(<QrEnviado {...opts} videoUrl={videoUrl} />);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `¡Tu eSIM ${opts.compania} está lista! Aquí está tu QR`,
    html,
  });
}
