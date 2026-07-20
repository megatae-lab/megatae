import { Html, Head, Body, Container, Text, Preview } from "@react-email/components";

interface Props {
  nombre: string;
  compania: string;
  observacion: string;
}

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function PagoRechazado({ nombre, compania, observacion }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu comprobante de pago para eSIM {compania} no pudo ser verificado</Preview>
      <Body style={{ fontFamily: font, backgroundColor: "#eef2f7", margin: 0, padding: "40px 16px" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>

          {/* Accent bar */}
          <div style={{ height: 5, background: "#dc2626", borderRadius: "8px 8px 0 0" }} />

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
              Hubo un problema con tu pago
            </Text>
            <Text style={{ color: "#4a5568", fontSize: 15, lineHeight: "24px", margin: "0 0 24px" }}>
              Hola <strong>{nombre}</strong>, revisamos tu comprobante de pago para la eSIM <strong>{compania}</strong> y no pudimos verificarlo.
            </Text>

            {/* Reason box */}
            <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
              <Text style={{ color: "#718096", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 10px" }}>
                Motivo del rechazo
              </Text>
              <div style={{ borderLeft: "3px solid #dc2626", paddingLeft: 14 }}>
                <Text style={{ color: "#742a2a", fontSize: 14, lineHeight: "22px", margin: 0 }}>
                  {observacion}
                </Text>
              </div>
            </div>

            {/* Next steps */}
            <div style={{ background: "#f7faff", border: "1px solid #d0e1fb", borderRadius: 10, padding: "20px 24px" }}>
              <Text style={{ color: "#718096", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 10px" }}>
                ¿Qué puedo hacer?
              </Text>
              <Text style={{ color: "#4a5568", fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
                · Verifica que el monto del comprobante coincida con el precio del plan.
              </Text>
              <Text style={{ color: "#4a5568", fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
                · Asegúrate de que el comprobante sea legible y muestre el folio.
              </Text>
              <Text style={{ color: "#4a5568", fontSize: 14, lineHeight: "22px", margin: 0 }}>
                · Si crees que es un error, responde a este correo y te ayudamos.
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
