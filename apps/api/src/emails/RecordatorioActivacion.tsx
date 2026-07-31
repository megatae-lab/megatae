import { Html, Head, Body, Container, Text, Img, Link, Preview } from "@react-email/components";

interface Props {
  folio: number;
  nombre: string;
  compania: string;
  companiaCode: "ATT" | "MOVISTAR" | "BAIT";
  dn?: string;
  iconUrl?: string;
  companiaLogoUrl?: string;
  assetsBaseUrl?: string;
}

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const linkColor = "#67e8f9";

const THEMES = {
  ATT: {
    gradient: "linear-gradient(160deg, #4a2a8c 0%, #7c3fae 50%, #a566cf 100%)",
    solid: "#3f1f7a",
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
          <td width={56} height={56} align="center" valign="middle" style={{ background, borderRadius: 14 }}>
            {icon}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function RecordatorioActivacion({ folio, nombre, compania, companiaCode, dn, iconUrl, companiaLogoUrl, assetsBaseUrl }: Props) {
  const theme = THEMES[companiaCode];

  const icon = (name: string, size: number) =>
    assetsBaseUrl ? (
      <Img src={`${assetsBaseUrl}/mail-${name}.png`} width={size} height={size} style={{ display: "block" }} />
    ) : null;

  return (
    <Html lang="es">
      <Head />
      <Preview>Registra tu línea {compania} — los beneficios de tu eSIM te esperan</Preview>
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
          <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 16px" }}>
            ¡Registra tu línea ya!
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 14, textAlign: "center", lineHeight: "21px", margin: "0 0 12px" }}>
            Los beneficios de tu eSIM te están esperando, solo tienes que entrar al sitio oficial de{" "}
            <span style={{ color: linkColor, fontWeight: 800 }}>{compania}/eSIM</span> para realizar tu trámite.
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 14, textAlign: "center", margin: "0 0 24px" }}>
            Es <span style={{ fontWeight: 800 }}>fácil, seguro</span> y muy <span style={{ fontWeight: 800 }}>rápido.</span>
          </Text>

          {/* Card: Tu eSIM */}
          <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: 700, textAlign: "center", margin: "0 0 14px" }}>
              Tu eSIM
            </Text>
            {companiaLogoUrl ? (
              <Img src={companiaLogoUrl} alt={compania} height={36} style={{ display: "block", margin: "0 auto 20px" }} />
            ) : (
              <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: 800, textAlign: "center", margin: "0 0 20px" }}>
                {compania}
              </Text>
            )}

            {dn ? (
              <table role="presentation" width="100%" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ background: "rgba(0,0,0,0.35)", borderRadius: 16, padding: "16px 20px" }}>
                      <table role="presentation" style={{ borderCollapse: "collapse" }}>
                        <tbody>
                          <tr>
                            <td style={{ paddingRight: 12 }}>
                              <table role="presentation" width={40} style={{ borderCollapse: "collapse" }}>
                                <tbody>
                                  <tr>
                                    <td width={40} height={40} align="center" valign="middle" style={{ background: "rgba(255,255,255,0.18)", borderRadius: 20 }}>
                                      {icon("phone", 18)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td>
                              <Text style={{ color: "#ffffff", fontSize: 12, margin: "0 0 2px" }}>Tu número asignado es:</Text>
                              <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: 1 }}>
                                {dn}
                              </Text>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : null}
          </div>

          {/* Ingresa a */}
          <table role="presentation" width="100%" style={{ borderCollapse: "collapse", marginBottom: 24 }}>
            <tbody>
              <tr>
                <td style={{ background: "rgba(0,0,0,0.35)", borderRadius: 12, padding: "14px 20px" }}>
                  <table role="presentation" width="100%" style={{ borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td align="center">
                          <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}>
                            Ingresa a
                          </Text>
                          <Text style={{ margin: 0 }}>
                            <Link href={theme.registroUrl} style={{ color: linkColor, fontSize: 13, fontWeight: 600 }}>
                              {theme.registroUrl}
                            </Link>
                          </Text>
                        </td>
                        <td width={24} valign="middle">
                          {icon("arrow-right", 18)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Beneficios */}
          <table role="presentation" width="100%" style={{ borderCollapse: "collapse", marginBottom: 28 }}>
            <tbody>
              <tr>
                <td width="33%" align="center">
                  <IconBox icon={icon("wifi-phone", 22)} background={theme.solid} />
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: "10px 0 0" }}>
                    Conéctate donde quieras
                  </Text>
                </td>
                <td width="33%" align="center">
                  <IconBox icon={icon("shield-lock", 22)} background={theme.solid} />
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: "10px 0 0" }}>
                    Red confiable y segura
                  </Text>
                </td>
                <td width="33%" align="center">
                  <IconBox icon={icon("gauge", 22)} background={theme.solid} />
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "16px", margin: "10px 0 0" }}>
                    Navegación rápida
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Closing */}
          <Text style={{ color: "#ffffff", fontSize: 14, textAlign: "center", margin: "0 0 24px" }}>
            <span style={{ fontWeight: 800 }}>¿Necesitas ayuda?</span> Contactate con nosotros
          </Text>

          {/* Footer */}
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textAlign: "center", margin: 0 }}>
            Megatae Global · Folio #{folio}
            <br />
            Este recordatorio es requerido por la normativa LMTR vigente en México.
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
