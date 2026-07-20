import { Html, Head, Body, Container, Text, Img, Preview } from "@react-email/components";

interface Props {
  nombre: string;
  compania: string;
  dn?: string;
  qrUrl: string;
}

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function RecordatorioActivacion({ nombre, compania, dn, qrUrl }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Recuerda activar tu eSIM {compania} — aquí tienes tu código QR de nuevo</Preview>
      <Body style={{ fontFamily: font, backgroundColor: "#eef2f7", margin: 0, padding: "40px 16px" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>

          {/* Accent bar */}
          <div style={{ height: 5, background: "#d97706", borderRadius: "8px 8px 0 0" }} />

          {/* Header */}
          <div style={{ background: "#022554", padding: "28px 36px 24px" }}>
            <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 800, letterSpacing: "-0.3px", margin: 0 }}>
              MEGATAE
            </Text>
            <Text style={{ color: "#7aa8e8", fontSize: 12, margin: "4px 0 0", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              eSIM Mexico
            </Text>
          </div>

          {/* Body */}
          <div style={{ background: "#ffffff", padding: "36px 36px 28px" }}>
            <Text style={{ color: "#022554", fontSize: 22, fontWeight: 700, margin: "0 0 8px", lineHeight: "30px" }}>
              Todavía no activaste tu eSIM
            </Text>
            <Text style={{ color: "#4a5568", fontSize: 15, lineHeight: "24px", margin: "0 0 24px" }}>
              Hola <strong>{nombre}</strong>, notamos que tu eSIM <strong>{compania}</strong> aún no ha sido activada. Aquí tienes tu código QR de nuevo para que puedas completar el proceso.
            </Text>

            {/* QR card */}
            <div style={{ background: "#fffdf7", border: "1px solid #fde68a", borderRadius: 12, padding: "28px 24px", textAlign: "center", marginBottom: 24 }}>
              <div style={{ background: "#ffffff", display: "inline-block", padding: 12, borderRadius: 10, border: "1px solid #fce082" }}>
                <Img
                  src={qrUrl}
                  alt="Código QR eSIM"
                  width="200"
                  height="200"
                  style={{ display: "block" }}
                />
              </div>
              {dn && (
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: "#92400e", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>
                    Número de línea asignado
                  </Text>
                  <Text style={{ color: "#78350f", fontSize: 20, fontWeight: 700, fontFamily: "monospace, monospace", margin: 0, letterSpacing: "2px" }}>
                    {dn}
                  </Text>
                </div>
              )}
            </div>

            {/* Steps */}
            <div style={{ background: "#f7faff", border: "1px solid #d0e1fb", borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
              <Text style={{ color: "#718096", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 12px" }}>
                Cómo activar tu eSIM
              </Text>
              <Text style={{ color: "#4a5568", fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
                1. Abre la cámara de tu teléfono y apúntala al código QR.
              </Text>
              <Text style={{ color: "#4a5568", fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
                2. Sigue las instrucciones en pantalla para agregar la eSIM.
              </Text>
              <Text style={{ color: "#4a5568", fontSize: 14, lineHeight: "22px", margin: 0 }}>
                3. Selecciona la nueva línea como tu línea activa.
              </Text>
            </div>

            {/* Help */}
            <div style={{ background: "#fff8e1", border: "1px solid #fce082", borderRadius: 10, padding: "14px 20px" }}>
              <Text style={{ color: "#92400e", fontSize: 13, margin: 0, lineHeight: "20px" }}>
                ¿Tienes problemas para activarla? Responde a este correo y te ayudamos personalmente.
              </Text>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "#f7fafc", borderTop: "1px solid #e2e8f0", borderRadius: "0 0 8px 8px", padding: "20px 36px" }}>
            <Text style={{ color: "#a0aec0", fontSize: 11, margin: 0, lineHeight: "18px" }}>
              Megatae Global · Si ya activaste tu línea, ignora este mensaje.
            </Text>
          </div>

        </Container>
      </Body>
    </Html>
  );
}
