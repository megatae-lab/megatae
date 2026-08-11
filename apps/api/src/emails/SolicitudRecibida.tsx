import { Html, Head, Font, Body, Container, Text, Img, Preview } from "@react-email/components";

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

const font = "'Poppins', Helvetica, Arial, sans-serif";
const gradient = "linear-gradient(160deg, #123a9e 0%, #1f66e6 40%, #123a9e 65%, #030a1f 100%)";
const noise =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const accent = "#3b82f6";
const highlight = "#7db2ff";
const cardBg = "rgba(255,255,255,0.08)";
const cardBorder = "1px solid rgba(255,255,255,0.25)";

function IconBox({ icon }: { icon: React.ReactNode }) {
  return (
    <table role="presentation" width={44} style={{ borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td width={44} height={44} align="center" valign="middle" style={{ background: accent, borderRadius: 22 }}>
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

  const iconWH = (name: string, width: number, height: number) =>
    assetsBaseUrl ? (
      <Img src={`${assetsBaseUrl}/mail-${name}.png`} width={width} height={height} style={{ display: "block" }} />
    ) : null;

  return (
    <Html lang="es">
      <Head>
        <Font
          fontFamily="Poppins"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          fontWeight={400}
          fontStyle="normal"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrJJfecg.woff2",
            format: "woff2",
          }}
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          fontWeight={500}
          fontStyle="normal"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLGT9Z1xlFQ.woff2",
            format: "woff2",
          }}
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          fontWeight={600}
          fontStyle="normal"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2",
            format: "woff2",
          }}
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          fontWeight={700}
          fontStyle="normal"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2",
            format: "woff2",
          }}
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          fontWeight={800}
          fontStyle="normal"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLDD4Z1xlFQ.woff2",
            format: "woff2",
          }}
        />
      </Head>
      <Preview>Recibimos tu solicitud de eSIM {compania} — estamos validando tu pago</Preview>
      <Body style={{ fontFamily: font, background: `${noise}, ${gradient}`, backgroundColor: "#0a1230", margin: 0, padding: "48px 16px" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto" }}>

          {/* Logo */}
          <table align="center" role="presentation" style={{ margin: "0 auto 32px" }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: "middle", paddingRight: 16 }}>
                  {iconUrl ? <Img src={iconUrl} alt="Megatae" width={64} style={{ display: "block", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }} /> : null}
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: 800, margin: 0, lineHeight: "28px", textShadow: "0 3px 4px rgba(0,0,0,0.35)" }}>
                    Megatae
                  </Text>
                  <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: 500, textAlign: "right", letterSpacing: "0.5px", margin: 0, lineHeight: "18px", textShadow: "0 3px 4px rgba(0,0,0,0.35)" }}>
                    Global
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Headline */}
          <Text style={{ color: "#ffffff", fontSize: 30, fontWeight: 700, textAlign: "center", lineHeight: "35px", margin: "0 0 24px" }}>
            ¡Felicidades por tu compra!
          </Text>

          {/* Card: verificando pago */}
          <div style={{ background: cardBg, border: cardBorder, borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <table role="presentation" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td valign="top" style={{ paddingRight: 14 }}>
                    {icon("user-check-v2", 36)}
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
          <div style={{ background: cardBg, border: cardBorder, borderRadius: 20, padding: 20, marginBottom: 24, textAlign: "center" }}>
            {companiaLogoUrl ? (
              <Img src={companiaLogoUrl} alt={compania} height={48} style={{ display: "block", margin: "4px auto 20px" }} />
            ) : (
              <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, margin: "0 0 20px" }}>{compania}</Text>
            )}

            <div style={{ background: cardBg, border: cardBorder, borderRadius: 14, padding: "16px 18px", textAlign: "left" }}>
              <table role="presentation" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td valign="top" style={{ paddingRight: 12 }}>
                      {iconWH("esim-nfc", 28, 34)}
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
                <td width="28%" align="center"><IconBox icon={iconWH("check-v2", 22, 20)} /></td>
                <td valign="middle">
                  <div style={{ borderTop: "1px dashed rgba(255,255,255,0.4)", fontSize: 0, lineHeight: 0 }}>&nbsp;</div>
                </td>
                <td width="28%" align="center"><IconBox icon={iconWH("mail-v2", 24, 18)} /></td>
                <td valign="middle">
                  <div style={{ borderTop: "1px dashed rgba(255,255,255,0.4)", fontSize: 0, lineHeight: 0 }}>&nbsp;</div>
                </td>
                <td width="28%" align="center"><IconBox icon={icon("phone", 22)} /></td>
              </tr>
              <tr>
                <td width="28%" align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: 0 }}>
                    1. Validamos tu pago
                  </Text>
                </td>
                <td />
                <td width="28%" align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: 0 }}>
                    2. Enviamos tu eSIM
                  </Text>
                </td>
                <td />
                <td width="28%" align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: 0 }}>
                    3. Registras tu línea
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
