import { Html, Head, Body, Container, Text, Img, Preview } from "@react-email/components";

interface Props {
  folio: number;
  nombre: string;
  compania: string;
  precio: string;
  recarga: string;
  iconUrl?: string;
  companiaLogoUrl?: string;
  assetsBaseUrl?: string;
}

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const gradient = "linear-gradient(160deg, #123a9e 0%, #1f66e6 40%, #123a9e 65%, #030a1f 100%)";
const accent = "#2563eb";
const highlight = "#7db2ff";

function IconBox({ icon }: { icon: React.ReactNode }) {
  return (
    <table role="presentation" width={56} style={{ borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td width={56} height={56} align="center" valign="middle" style={{ background: accent, borderRadius: 14 }}>
            {icon}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function SolicitudRecibida({ folio, nombre, compania, precio, recarga, iconUrl, companiaLogoUrl, assetsBaseUrl }: Props) {
  const icon = (name: string, size: number) =>
    assetsBaseUrl ? (
      <Img src={`${assetsBaseUrl}/mail-${name}.png`} width={size} height={size} style={{ display: "block" }} />
    ) : null;

  return (
    <Html lang="es">
      <Head />
      <Preview>Recibimos tu solicitud de eSIM {compania} — estamos validando tu pago</Preview>
      <Body style={{ fontFamily: font, background: gradient, backgroundColor: "#0a1230", margin: 0, padding: "48px 16px" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto" }}>

          {/* Logo */}
          <table align="center" role="presentation" style={{ margin: "0 auto 32px" }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: "middle", paddingRight: 16 }}>
                  {iconUrl ? <Img src={iconUrl} alt="Megatae" width={64} style={{ display: "block" }} /> : null}
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: 800, margin: 0, lineHeight: "32px" }}>
                    Megatae
                  </Text>
                  <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: 800, margin: 0, lineHeight: "34px" }}>
                    Global
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Headline */}
          <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: 800, textAlign: "center", margin: "0 0 24px" }}>
            ¡Felicidades por tu compra!
          </Text>

          {/* Card: verificando pago */}
          <div style={{ backgroundColor: "rgba(4, 12, 36, 0.55)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <table role="presentation" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td valign="top" style={{ paddingRight: 14 }}>
                    {icon("user-check", 26)}
                  </td>
                  <td valign="top">
                    <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: 800, margin: "0 0 4px" }}>
                      Estamos verificando tu pago
                    </Text>
                    <Text style={{ color: "#cbd8f5", fontSize: 13, lineHeight: "19px", margin: 0 }}>
                      Te notificaremos por correo en cuanto tu pago quede confirmado
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Card: resumen de compra */}
          <div style={{ border: "1px solid #ffffff", borderRadius: 20, padding: 20, marginBottom: 24, textAlign: "center" }}>
            {companiaLogoUrl ? (
              <Img src={companiaLogoUrl} alt={compania} height={32} style={{ display: "block", margin: "4px auto 20px" }} />
            ) : (
              <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, margin: "0 0 20px" }}>{compania}</Text>
            )}

            <div style={{ border: "1px solid #ffffff", borderRadius: 14, padding: "16px 18px", textAlign: "left" }}>
              <table role="presentation" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td valign="top" style={{ paddingRight: 12 }}>
                      {icon("smartphone-nfc", 22)}
                    </td>
                    <td valign="top">
                      <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: 700, lineHeight: "18px", margin: "0 0 4px" }}>
                        eSIM {compania}
                      </Text>
                      <Text style={{ color: "#dbe6fb", fontSize: 13, lineHeight: "16px", margin: "0 0 1px" }}>Total pagado</Text>
                      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, lineHeight: "22px", margin: "0 0 2px" }}>
                        ${precio} MXN
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: "16px", margin: 0 }}>
                        Incluye recarga de ${recarga} MXN
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Qué sigue */}
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, textAlign: "center", margin: "0 0 20px" }}>
            ¿Qué sigue?
          </Text>

          <table role="presentation" width="100%" style={{ borderCollapse: "collapse", marginBottom: 8 }}>
            <tbody>
              <tr>
                <td width={56} align="center"><IconBox icon={icon("check", 22)} /></td>
                <td valign="middle">
                  <div style={{ borderTop: "2px dashed #ffffff", fontSize: 0, lineHeight: 0 }}>&nbsp;</div>
                </td>
                <td width={56} align="center"><IconBox icon={icon("mail", 22)} /></td>
                <td valign="middle">
                  <div style={{ borderTop: "2px dashed #ffffff", fontSize: 0, lineHeight: 0 }}>&nbsp;</div>
                </td>
                <td width={56} align="center"><IconBox icon={icon("smartphone-nfc", 22)} /></td>
              </tr>
              <tr>
                <td width={56} align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: 0 }}>
                    1.- Validamos tu pago
                  </Text>
                </td>
                <td />
                <td width={56} align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: 0 }}>
                    2.- Te enviamos tu eSIM y la activas
                  </Text>
                </td>
                <td />
                <td width={56} align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: 0 }}>
                    3.- Registras tu línea
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Closing */}
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 700, textAlign: "center", margin: "32px 0 4px" }}>
            Gracias por confiar en <span style={{ color: highlight }}>Megatae Global</span>
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 700, textAlign: "center", margin: "0 0 32px" }}>
            Tu <span style={{ color: highlight }}>conexión</span> está cada vez <span style={{ color: highlight }}>más cerca</span>
          </Text>

          {/* Footer */}
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textAlign: "center", margin: 0 }}>
            Megatae Global · Folio #{folio}
            <br />
            Si no realizaste esta solicitud, ignora este mensaje.
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
