import { Html, Head, Font, Body, Container, Text, Img, Preview } from "@react-email/components";

interface Props {
  folio: number;
  nombre: string;
  iconUrl?: string;
  assetsBaseUrl?: string;
}

const font = "'Baloo 2', Helvetica, Arial, sans-serif";
const gradient = "linear-gradient(180deg, #0080f6 0%, #0066d2 22%, #0048a0 44%, #003070 67%, #001f52 89%, #001949 100%)";

export function FueraDeHorario({ folio, nombre, iconUrl, assetsBaseUrl }: Props) {
  const calendarIconUrl = assetsBaseUrl ? `${assetsBaseUrl}/mail-calendar.png` : undefined;

  return (
    <Html lang="es">
      <Head>
        <Font
          fontFamily="Baloo 2"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          fontWeight={700}
          fontStyle="normal"
          webFont={{
            url: "https://fonts.gstatic.com/s/baloo2/v23/wXK0E3kTposypRydzVT08TS3JnAmtdj9yppo_lc.woff2",
            format: "woff2",
          }}
        />
        <Font
          fontFamily="Baloo 2"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          fontWeight={800}
          fontStyle="normal"
          webFont={{
            url: "https://fonts.gstatic.com/s/baloo2/v23/wXK0E3kTposypRydzVT08TS3JnAmtdiayppo_lc.woff2",
            format: "woff2",
          }}
        />
      </Head>
      <Preview>¡Uups! Nos encontraste fuera de horario — tu solicitud ya quedó registrada</Preview>
      <Body style={{ fontFamily: font, background: gradient, backgroundColor: "#001949", margin: 0, padding: "48px 16px" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto" }}>

          {/* Logo */}
          <table align="center" role="presentation" style={{ margin: "0 auto 32px" }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: "middle", paddingRight: 16 }}>
                  {iconUrl ? (
                    <Img src={iconUrl} alt="Megatae" width={64} style={{ display: "block", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }} />
                  ) : null}
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: 800, margin: 0, lineHeight: "32px", textShadow: "0 3px 4px rgba(0,0,0,0.35)" }}>
                    Megatae
                  </Text>
                  <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 700, textAlign: "right", margin: 0, lineHeight: "24px", textShadow: "0 3px 4px rgba(0,0,0,0.35)" }}>
                    Global
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Headline */}
          <Text style={{ color: "#ffffff", fontSize: 40, fontWeight: 800, textAlign: "center", margin: "0 0 4px" }}>
            ¡Uups!
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 700, textAlign: "center", lineHeight: "28px", margin: "0 0 32px" }}>
            Nos encontraste fuera de horario
          </Text>

          {/* Card: solicitud registrada */}
          <div style={{ backgroundColor: "#00408a", borderRadius: 16, padding: "24px 28px", marginBottom: 20, textAlign: "center" }}>
            <Text style={{ color: "#ffffff", fontSize: 17, fontWeight: 700, lineHeight: "24px", margin: "0 0 8px" }}>
              No te preocupes, {nombre}, tu solicitud quedó registrada
            </Text>
            <Text style={{ color: "#cbd8f5", fontSize: 14, lineHeight: "21px", margin: 0 }}>
              En cuanto iniciemos nuestro horario de atención, la revisaremos y te contactaremos
            </Text>
          </div>

          {/* Card: horario */}
          <div style={{ background: "linear-gradient(180deg, #005cc8 0%, #0047a7 100%)", backgroundColor: "#0052b5", borderRadius: 16, padding: "24px 28px", marginBottom: 32, textAlign: "center" }}>
            <table role="presentation" align="center" style={{ borderCollapse: "collapse", margin: "0 auto 16px" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: 10 }}>
                    {calendarIconUrl ? (
                      <Img src={calendarIconUrl} alt="" width={34} height={26} style={{ display: "block" }} />
                    ) : null}
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: 700, margin: 0, whiteSpace: "nowrap" }}>
                      Horario de atención
                    </Text>
                  </td>
                  <td style={{ verticalAlign: "middle", paddingLeft: 10 }}>
                    {calendarIconUrl ? (
                      <Img src={calendarIconUrl} alt="" width={34} height={26} style={{ display: "block" }} />
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
            <Text style={{ color: "#dbe6fb", fontSize: 14, margin: "0 0 2px" }}>
              Lunes a sábado
            </Text>
            <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: 700, margin: "0 0 14px" }}>
              9:00 am - 11:00 pm
            </Text>
            <Text style={{ color: "#dbe6fb", fontSize: 14, margin: "0 0 2px" }}>
              Domingos
            </Text>
            <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: 700, margin: 0 }}>
              9:00 am - 11:00 pm
            </Text>
          </div>

          {/* Closing */}
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: 700, textAlign: "center", margin: "0 0 4px" }}>
            ¡Gracias por <span style={{ color: "#7db2ff" }}>tu paciencia</span>!
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: 700, textAlign: "center", margin: "0 0 32px" }}>
            Muy pronto estaremos contigo.
          </Text>

          {/* Footer */}
          <Text style={{ color: "rgba(255, 255, 255, 0.45)", fontSize: 11, textAlign: "center", margin: 0 }}>
            Megatae Global · Folio #{folio}
            <br />
            megatae.mx
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
