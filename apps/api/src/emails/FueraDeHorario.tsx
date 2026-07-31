import { Html, Head, Body, Container, Text, Img, Preview } from "@react-email/components";

interface Props {
  nombre: string;
  iconUrl?: string;
}

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const gradient = "linear-gradient(160deg, #123a9e 0%, #1f66e6 40%, #123a9e 65%, #030a1f 100%)";

export function FueraDeHorario({ nombre, iconUrl }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>¡Uups! Nos encontraste fuera de horario — tu solicitud ya quedó registrada</Preview>
      <Body style={{ fontFamily: font, background: gradient, backgroundColor: "#0a1230", margin: 0, padding: "48px 16px" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto" }}>

          {/* Logo */}
          <table align="center" role="presentation" style={{ margin: "0 auto 32px" }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: "middle", paddingRight: 12 }}>
                  {iconUrl ? (
                    <Img src={iconUrl} alt="Megatae" width={44} style={{ display: "block" }} />
                  ) : null}
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: 800, margin: 0, lineHeight: "26px" }}>
                    Megatae
                  </Text>
                  <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: 800, margin: 0, lineHeight: "28px" }}>
                    Global
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Headline */}
          <Text style={{ color: "#ffffff", fontSize: 38, fontWeight: 900, textAlign: "center", margin: "0 0 4px" }}>
            ¡Uups!
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: 700, textAlign: "center", lineHeight: "30px", margin: "0 0 32px" }}>
            Nos encontraste fuera de horario
          </Text>

          {/* Card: solicitud registrada */}
          <div style={{ backgroundColor: "rgba(4, 12, 36, 0.55)", borderRadius: 16, padding: "24px 28px", marginBottom: 20, textAlign: "center" }}>
            <Text style={{ color: "#ffffff", fontSize: 17, fontWeight: 700, lineHeight: "24px", margin: "0 0 8px" }}>
              No te preocupes, {nombre}, tu solicitud quedó registrada
            </Text>
            <Text style={{ color: "#cbd8f5", fontSize: 14, lineHeight: "21px", margin: 0 }}>
              En cuanto iniciemos nuestro horario de atención, la revisaremos y te contactaremos
            </Text>
          </div>

          {/* Card: horario */}
          <div style={{ backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: 16, padding: "24px 28px", marginBottom: 32, textAlign: "center" }}>
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>
              🗓️ Horario de atención 🗓️
            </Text>
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
            Megatae Global · megatae.mx
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
