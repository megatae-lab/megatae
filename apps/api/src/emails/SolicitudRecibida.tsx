import { Html, Head, Body, Container, Text, Hr, Preview, Img } from "@react-email/components";

interface Props {
  nombre: string;
  compania: string;
  precio: string;
  recarga: string;
  logoUrl?: string;
}

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function SolicitudRecibida({ nombre, compania, precio, recarga, logoUrl }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Recibimos tu solicitud de eSIM {compania} — estamos validando tu pago</Preview>
      <Body style={{ fontFamily: font, backgroundColor: "#eef2f7", margin: 0, padding: "40px 16px" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>

          {/* Accent bar */}
          <div style={{ height: 5, background: "#1365d2", borderRadius: "8px 8px 0 0" }} />

          {/* Header */}
          <div style={{ background: "#022554", padding: "24px 36px" }}>
            {logoUrl ? (
              <Img src={logoUrl} alt="MEGATAE" height={44} style={{ display: "block" }} />
            ) : (
              <>
                <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 800, letterSpacing: "-0.3px", margin: 0 }}>
                  MEGATAE
                </Text>
                <Text style={{ color: "#7aa8e8", fontSize: 12, margin: "4px 0 0", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  eSIM Mexico
                </Text>
              </>
            )}
          </div>

          {/* Body */}
          <div style={{ background: "#ffffff", padding: "36px 36px 28px" }}>
            <Text style={{ color: "#022554", fontSize: 22, fontWeight: 700, margin: "0 0 8px", lineHeight: "30px" }}>
              ¡Gracias por tu compra, {nombre}!
            </Text>
            <Text style={{ color: "#4a5568", fontSize: 15, lineHeight: "24px", margin: "0 0 24px" }}>
              Recibimos tu solicitud de eSIM. Estamos validando tu pago y en cuanto lo confirmemos recibirás tu código QR para activar tu nueva línea.
            </Text>

            {/* Summary card */}
            <div style={{ background: "#f7faff", border: "1px solid #d0e1fb", borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
              <Text style={{ color: "#718096", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 16px" }}>
                Resumen de tu solicitud
              </Text>
              <table width="100%" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ color: "#718096", fontSize: 13, paddingBottom: 10 }}>Compañía</td>
                    <td style={{ color: "#1a202c", fontSize: 13, fontWeight: 600, textAlign: "right", paddingBottom: 10 }}>{compania}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#718096", fontSize: 13, paddingBottom: 10, borderTop: "1px solid #e8f0fe", paddingTop: 10 }}>Total pagado</td>
                    <td style={{ color: "#1365d2", fontSize: 15, fontWeight: 700, textAlign: "right", borderTop: "1px solid #e8f0fe", paddingTop: 10 }}>${precio} MXN</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#718096", fontSize: 13, borderTop: "1px solid #e8f0fe", paddingTop: 10 }}>Incluye recarga</td>
                    <td style={{ color: "#1a202c", fontSize: 13, fontWeight: 600, textAlign: "right", borderTop: "1px solid #e8f0fe", paddingTop: 10 }}>${recarga} MXN</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Status pill */}
            <div style={{ background: "#fff8e1", border: "1px solid #fce082", borderRadius: 8, padding: "12px 16px" }}>
              <Text style={{ color: "#92400e", fontSize: 13, margin: 0, lineHeight: "20px" }}>
                <strong>Estado actual:</strong> Tu pago está en revisión. Normalmente validamos en menos de 24 horas.
              </Text>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "#f7fafc", borderTop: "1px solid #e2e8f0", borderRadius: "0 0 8px 8px", padding: "20px 36px" }}>
            <Text style={{ color: "#a0aec0", fontSize: 11, margin: 0, lineHeight: "18px" }}>
              Megatae Global · Si no realizaste esta solicitud, ignora este mensaje.
            </Text>
          </div>

        </Container>
      </Body>
    </Html>
  );
}
