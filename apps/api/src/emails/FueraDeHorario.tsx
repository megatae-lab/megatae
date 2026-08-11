import { Html, Head, Font, Body, Container, Text, Img, Preview } from "@react-email/components";

interface Props {
  folio: number;
  nombre: string;
  iconUrl?: string;
  assetsBaseUrl?: string;
}

const font = "'Poppins', Helvetica, Arial, sans-serif";
const gradient = "linear-gradient(180deg, #0080f6 0%, #0048a0 50%, #001949 100%)";

export function FueraDeHorario({ iconUrl, assetsBaseUrl }: Props) {
  const calendarIconUrl = assetsBaseUrl ? `${assetsBaseUrl}/mail-calendar.png` : undefined;

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
      <Preview>¡Uups! Nos encontraste fuera de horario — tu solicitud ya quedó registrada</Preview>
      <Body style={{ fontFamily: font, background: gradient, backgroundColor: "#001949", margin: 0, padding: "36px 16px" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: "0 40px" }}>

          {/* Logo */}
          <table align="center" role="presentation" style={{ margin: "0 auto 20px" }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: "middle", paddingRight: 16 }}>
                  {iconUrl ? (
                    <Img src={iconUrl} alt="Megatae" width={64} style={{ display: "block", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }} />
                  ) : null}
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
          <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: 700, textAlign: "center", lineHeight: "34px", margin: 0 }}>
            ¡Uups!
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: 600, textAlign: "center", lineHeight: "24px", margin: "0 0 20px" }}>
            Nos encontraste fuera de horario
          </Text>

          {/* Card: solicitud registrada */}
          <div style={{ backgroundColor: "#00408a", borderRadius: 16, padding: "16px 20px", marginBottom: 14, textAlign: "center" }}>
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: 700, lineHeight: "21px", margin: "0 0 6px" }}>
              No te preocupes, tu solicitud quedó registrada
            </Text>
            <Text style={{ color: "#cbd8f5", fontSize: 13, lineHeight: "19px", margin: 0 }}>
              En cuanto iniciemos nuestro horario de atención, la revisaremos y te contactaremos
            </Text>
          </div>

          {/* Card: horario */}
          <div style={{ background: "linear-gradient(180deg, #005cc8 0%, #0047a7 100%)", backgroundColor: "#0052b5", borderRadius: 16, padding: "10px 20px", marginBottom: 20, textAlign: "center" }}>
            <table role="presentation" align="center" style={{ borderCollapse: "collapse", margin: "0 auto 8px" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: 10 }}>
                    {calendarIconUrl ? (
                      <Img src={calendarIconUrl} alt="" width={26} height={20} style={{ display: "block" }} />
                    ) : null}
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: 700, margin: 0, whiteSpace: "nowrap" }}>
                      Horario de atención
                    </Text>
                  </td>
                  <td style={{ verticalAlign: "middle", paddingLeft: 10 }}>
                    {calendarIconUrl ? (
                      <Img src={calendarIconUrl} alt="" width={26} height={20} style={{ display: "block" }} />
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
            <Text style={{ color: "#dbe6fb", fontSize: 13, fontWeight: 700, margin: "0 0 1px" }}>
              Lunes a sábado
            </Text>
            <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>
              9:00 am - 11:00 pm
            </Text>
            <Text style={{ color: "#dbe6fb", fontSize: 13, fontWeight: 700, margin: "0 0 1px" }}>
              Domingos
            </Text>
            <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: 700, margin: 0 }}>
              9:00 am - 11:00 pm
            </Text>
          </div>

          {/* Closing */}
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: 700, textAlign: "center", margin: "0 0 4px" }}>
            ¡Gracias por <span style={{ color: "#4FC3F7" }}>tu paciencia</span>!
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: 700, textAlign: "center", margin: 0 }}>
            Muy pronto estaremos contigo.
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
