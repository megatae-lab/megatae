import { Html, Head, Body, Container, Heading, Text, Hr } from "@react-email/components";

interface Props {
  nombre: string;
  compania: string;
  observacion: string;
}

export function PagoRechazado({ nombre, compania, observacion }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f6f6", margin: 0 }}>
        <Container
          style={{
            maxWidth: 600,
            margin: "32px auto",
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "8px",
          }}
        >
          <Heading style={{ color: "#030b1a", fontSize: 22, marginTop: 0 }}>
            Tu comprobante no pudo ser verificado
          </Heading>
          <Text style={{ color: "#444444", fontSize: 16, lineHeight: "24px" }}>
            Hola <strong>{nombre}</strong>, revisamos tu comprobante de pago para la
            eSIM <strong>{compania}</strong> y no pudimos verificarlo por el siguiente motivo:
          </Text>
          <Text
            style={{
              color: "#444444",
              fontSize: 15,
              lineHeight: "22px",
              backgroundColor: "#f9f9f9",
              borderLeft: "4px solid #e53e3e",
              padding: "12px 16px",
              margin: "16px 0",
            }}
          >
            {observacion}
          </Text>
          <Text style={{ color: "#444444", fontSize: 16, lineHeight: "24px" }}>
            Si crees que hubo un error o tienes dudas, responde a este correo y con
            gusto te ayudamos.
          </Text>
          <Hr style={{ borderColor: "#e5e5e5", margin: "24px 0" }} />
          <Text style={{ color: "#999999", fontSize: 12, margin: 0 }}>
            Megatae Global · Si no realizaste esta solicitud, ignora este mensaje.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
