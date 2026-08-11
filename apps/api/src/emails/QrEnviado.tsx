import { Html, Head, Font, Body, Container, Text, Img, Link, Preview } from "@react-email/components";

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

const font = "'Poppins', Helvetica, Arial, sans-serif";
const linkColor = "#67e8f9";

const THEMES = {
  ATT: {
    gradient: "linear-gradient(160deg, #4a2a8c 0%, #7c3fae 50%, #a566cf 100%)",
    solid: "#5b2a99",
    accent: "#8e01ff",
    registroUrl: "https://www.att.com.mx/vinculatulinearegistro/",
  },
  BAIT: {
    gradient: "linear-gradient(160deg, #f97316 0%, #fbbf24 100%)",
    solid: "#111111",
    accent: "#d0a800",
    registroUrl: "https://mibait.com/registra-tu-linea",
  },
  MOVISTAR: {
    gradient: "linear-gradient(180deg, #00d200 0%, #008800 100%)",
    solid: "#2d7a00",
    accent: "#009e00",
    registroUrl: "https://www.movistar.com.mx/vinculatulinea",
  },
} as const;

function IconBox({ icon, background }: { icon: React.ReactNode; background: string }) {
  return (
    <table role="presentation" width={58} style={{ borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td
            width={58}
            height={52}
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

export function QrEnviado({ folio, compania, companiaCode, precio, recarga, dn, qrUrl, iconUrl, companiaLogoUrl, assetsBaseUrl }: Props) {
  const theme = THEMES[companiaCode];

  const icon = (name: string, size: number) =>
    assetsBaseUrl ? (
      <Img src={`${assetsBaseUrl}/mail-${name}.png`} width={size} height={size} style={{ display: "block" }} />
    ) : null;

  const iconWH = (name: string, width: number, height: number) =>
    assetsBaseUrl ? (
      <Img src={`${assetsBaseUrl}/mail-${name}.png`} width={width} height={height} style={{ display: "block" }} />
    ) : null;

  const guideUrl = assetsBaseUrl ? `${assetsBaseUrl}/como-instalar-tu-esim.pdf` : undefined;

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
      <Preview>Tu eSIM {compania} está lista — escanea el QR para activarla</Preview>
      <Body style={{ fontFamily: font, background: theme.gradient, backgroundColor: theme.solid, margin: 0, padding: "48px 16px" }}>
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
          <Text style={{ color: "#ffffff", fontSize: 30, fontWeight: 700, textAlign: "center", lineHeight: "35px", margin: "0 0 6px" }}>
            ¡Tu eSIM {compania} está lista!
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 15, textAlign: "center", margin: "0 0 24px" }}>
            Escanea el código QR para activar tu línea
          </Text>

          {/* Card */}
          <div style={{ border: "1px solid #ffffff", borderRadius: 20, padding: 24, marginBottom: 24 }}>
            <table role="presentation" width="100%" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td width="52%" valign="top" align="center" style={{ textAlign: "center" }}>
                    {companiaLogoUrl ? (
                      <Img src={companiaLogoUrl} alt={compania} height={45} style={{ display: "block", margin: "0 auto 18px" }} />
                    ) : (
                      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, margin: "0 0 18px" }}>{compania}</Text>
                    )}

                    <div style={{ border: "1px solid #ffffff", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "center" }}>
                      <Text style={{ color: "#ffffff", fontSize: 12, margin: "0 0 6px" }}>Tu número asignado es:</Text>
                      {dn ? (
                        <table role="presentation" align="center" style={{ borderCollapse: "collapse" }}>
                          <tbody>
                            <tr>
                              <td style={{ paddingRight: 8 }}>{icon("phone", 28)}</td>
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

                    <table role="presentation" align="center" style={{ borderCollapse: "collapse", marginBottom: 2 }}>
                      <tbody>
                        <tr>
                          <td style={{ paddingRight: 8 }}>{iconWH("smartphone-nfc", 22, 26)}</td>
                          <td><Text style={{ color: "#ffffff", fontSize: 13, margin: 0 }}>Total pagado</Text></td>
                        </tr>
                      </tbody>
                    </table>
                    <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, textAlign: "center", margin: "0 0 4px" }}>
                      ${precio} MXN
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, textAlign: "center", margin: 0 }}>
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

          {/* Aviso Wi-Fi */}
          <div style={{ background: "#ffffff", borderRadius: 10, padding: "10px 14px", maxWidth: 220, marginTop: -30, marginBottom: 24 }}>
            <Text style={{ color: "#111111", fontSize: 12, fontWeight: 700, lineHeight: "16px", margin: 0 }}>
              Conéctate a una red Wi-Fi estable <span style={{ color: theme.accent }}>antes de instalar</span> tu eSIM.
            </Text>
          </div>

          {/* Cómo activarla */}
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, textAlign: "center", margin: "0 0 20px" }}>
            ¿Cómo activarla?
          </Text>

          <table role="presentation" width="100%" style={{ borderCollapse: "collapse", marginBottom: 8 }}>
            <tbody>
              <tr>
                <td width={60} align="center"><IconBox icon={iconWH("configurar", 36, 36)} background={theme.solid} /></td>
                <td valign="middle">
                  <div style={{ borderTop: "2px dashed #ffffff", fontSize: 0, lineHeight: 0 }}>&nbsp;</div>
                </td>
                <td width={60} align="center"><IconBox icon={iconWH("escanear", 22, 34)} background={theme.solid} /></td>
                <td valign="middle">
                  <div style={{ borderTop: "2px dashed #ffffff", fontSize: 0, lineHeight: 0 }}>&nbsp;</div>
                </td>
                <td width={60} align="center"><IconBox icon={iconWH("confirmar", 31, 32)} background={theme.solid} /></td>
                <td valign="middle">
                  <div style={{ borderTop: "2px dashed #ffffff", fontSize: 0, lineHeight: 0 }}>&nbsp;</div>
                </td>
                <td width={60} align="center"><IconBox icon={iconWH("usar", 34, 36)} background={theme.solid} /></td>
              </tr>
              <tr>
                <td width={60} align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: "15px", margin: 0 }}>
                    Abre la configuración de tu teléfono
                  </Text>
                </td>
                <td />
                <td width={60} align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: "15px", margin: 0 }}>
                    Escanea el código QR
                  </Text>
                </td>
                <td />
                <td width={60} align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: "15px", margin: 0 }}>
                    Confirma la instalación
                  </Text>
                </td>
                <td />
                <td width={60} align="center" style={{ paddingTop: 10 }}>
                  <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: "15px", margin: 0 }}>
                    Activa y comienza a usarla
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Guía de instalación */}
          {guideUrl ? (
            <Link href={guideUrl} style={{ display: "block", textDecoration: "none" }}>
              <table role="presentation" width="100%" style={{ borderCollapse: "collapse", marginBottom: 24 }}>
                <tbody>
                  <tr>
                    <td style={{ background: "#2563eb", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                      <Text style={{ color: "#ffffff", fontSize: 13, margin: "0 0 2px" }}>
                        ¿Necesitas ayuda para instalar tu eSIM?
                      </Text>
                      <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: 800, margin: 0 }}>
                        Abrir guía de instalación
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Link>
          ) : null}

          {/* Registra tu línea */}
          <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 16, padding: "20px 22px", marginTop: 24, marginBottom: 24 }}>
            <table role="presentation" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td valign="top" style={{ paddingRight: 14 }}>
                    {icon("id-card", 40)}
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
