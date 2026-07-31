import { Html, Head, Body, Container, Text, Img, Link, Preview } from "@react-email/components";

interface Props {
  folio: number;
  nombre: string;
  compania: string;
  companiaCode: "ATT" | "MOVISTAR" | "BAIT";
  precio: string;
  recarga: string;
  dn?: string;
  qrUrl: string;
  iconUrl?: string;
  companiaLogoUrl?: string;
  assetsBaseUrl?: string;
}

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const linkColor = "#67e8f9";

const THEMES = {
  ATT: {
    gradient: "linear-gradient(160deg, #4a2a8c 0%, #7c3fae 50%, #a566cf 100%)",
    solid: "#5b2a99",
    registroUrl: "https://www.att.com.mx/vinculatulinearegistro/",
  },
  BAIT: {
    gradient: "linear-gradient(160deg, #f97316 0%, #fbbf24 100%)",
    solid: "#111111",
    registroUrl: "https://mibait.com/registra-tu-linea",
  },
  MOVISTAR: {
    gradient: "linear-gradient(160deg, #3fa800 0%, #55d100 45%, #2d7a00 100%)",
    solid: "#2d7a00",
    registroUrl: "https://www.movistar.com.mx/vinculatulinea",
  },
} as const;

function IconBox({ icon, background }: { icon: React.ReactNode; background: string }) {
  return (
    <table role="presentation" width={56} style={{ borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td
            width={56}
            height={56}
            align="center"
            valign="middle"
            style={{ background, borderRadius: 14 }}
          >
            {icon}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function QrEnviado({ folio, nombre, compania, companiaCode, precio, recarga, dn, qrUrl, iconUrl, companiaLogoUrl, assetsBaseUrl }: Props) {
  const theme = THEMES[companiaCode];

  const icon = (name: string, size: number) =>
    assetsBaseUrl ? (
      <Img src={`${assetsBaseUrl}/mail-${name}.png`} width={size} height={size} style={{ display: "block" }} />
    ) : null;

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu eSIM {compania} está lista — escanea el QR para activarla</Preview>
      <Body style={{ fontFamily: font, background: theme.gradient, backgroundColor: theme.solid, margin: 0, padding: "48px 16px" }}>
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
          <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: 800, textAlign: "center", margin: "0 0 6px" }}>
            ¡Tu eSIM {compania} está lista!
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 15, textAlign: "center", margin: "0 0 24px" }}>
            Hola {nombre}, escanea el código QR para activar tu línea
          </Text>

          {/* Card */}
          <div style={{ border: "1px solid #ffffff", borderRadius: 20, padding: 24, marginBottom: 24 }}>
            <table role="presentation" width="100%" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td width="52%" valign="top">
                    {companiaLogoUrl ? (
                      <Img src={companiaLogoUrl} alt={compania} height={36} style={{ display: "block", marginBottom: 18 }} />
                    ) : (
                      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, margin: "0 0 18px" }}>{compania}</Text>
                    )}

                    <div style={{ border: "1px solid #ffffff", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                      <Text style={{ color: "#ffffff", fontSize: 12, margin: "0 0 6px" }}>Tu número asignado es:</Text>
                      {dn ? (
                        <table role="presentation" style={{ borderCollapse: "collapse" }}>
                          <tbody>
                            <tr>
                              <td style={{ paddingRight: 8 }}>{icon("phone", 16)}</td>
                              <td>
                                <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: 1 }}>
                                  {dn}
                                </Text>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      ) : null}
                    </div>

                    <table role="presentation" style={{ borderCollapse: "collapse", marginBottom: 2 }}>
                      <tbody>
                        <tr>
                          <td><Text style={{ color: "#ffffff", fontSize: 13, margin: 0 }}>Total pagado</Text></td>
                        </tr>
                      </tbody>
                    </table>
                    <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>
                      ${precio} MXN
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}>
                      Incluye recarga de ${recarga} MXN
                    </Text>
                  </td>
                  <td width="48%" valign="top" align="center">
                    <div style={{ backgroundColor: "#ffffff", display: "inline-block", padding: 10, borderRadius: 10 }}>
                      <Img src={qrUrl} alt="Código QR eSIM" width={160} height={160} style={{ display: "block" }} />
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <table role="presentation" align="center" style={{ borderCollapse: "collapse" }}>
                        <tbody>
                          <tr>
                            <td style={{ background: "#2563eb", borderRadius: 8, padding: "10px 18px" }}>
                              <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: 700, margin: 0 }}>
                                Activar mi eSIM
                              </Text>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cómo activarla */}
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, textAlign: "center", margin: "0 0 20px" }}>
            ¿Cómo activarla?
          </Text>

          <table role="presentation" width="100%" style={{ borderCollapse: "collapse", marginBottom: 8 }}>
            <tbody>
              <tr>
                <td width={56} align="center"><IconBox icon={icon("scan", 22)} background={theme.solid} /></td>
                <td valign="middle">
                  <div style={{ borderTop: "2px dashed #ffffff", fontSize: 0, lineHeight: 0 }}>&nbsp;</div>
                </td>
                <td width={56} align="center"><IconBox icon={icon("settings", 22)} background={theme.solid} /></td>
                <td valign="middle">
                  <div style={{ borderTop: "2px dashed #ffffff", fontSize: 0, lineHeight: 0 }}>&nbsp;</div>
                </td>
                <td width={56} align="center"><IconBox icon={icon("check", 22)} background={theme.solid} /></td>
              </tr>
              <tr>
                <td width={56} align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: 0 }}>
                    Escanea este código QR
                  </Text>
                </td>
                <td />
                <td width={56} align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: 0 }}>
                    Sigue los pasos en tu dispositivo
                  </Text>
                </td>
                <td />
                <td width={56} align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: 0 }}>
                    Activa tu línea y disfrutar
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Registra tu línea */}
          <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 16, padding: "20px 22px", marginTop: 24, marginBottom: 24 }}>
            <table role="presentation" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td valign="top" style={{ paddingRight: 14 }}>
                    {icon("id-card", 26)}
                  </td>
                  <td valign="top">
                    <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: 800, margin: "0 0 6px" }}>
                      ¡Registra tu línea ya!
                    </Text>
                    <Text style={{ margin: "0 0 6px" }}>
                      <Link href={theme.registroUrl} style={{ color: linkColor, fontSize: 13, fontWeight: 600 }}>
                        {theme.registroUrl}
                      </Link>
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: 0 }}>
                      y comienza a gozar de los beneficios.
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

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
