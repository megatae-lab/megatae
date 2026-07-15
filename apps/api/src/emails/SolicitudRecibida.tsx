import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
} from "@react-email/components";

interface Props {
  nombre: string;
  compania: string;
  precio: string;
  recarga: string;
}

export function SolicitudRecibida({ nombre, compania, precio, recarga }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Body
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f6f6f6",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: 600,
            margin: "32px auto",
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "8px",
          }}
        >
          <Heading
            style={{ color: "#030b1a", fontSize: 24, marginBottom: 8, marginTop: 0 }}
          >
            ¡Gracias por tu compra, {nombre}!
          </Heading>
          <Text style={{ color: "#444444", fontSize: 16, lineHeight: "24px" }}>
            Recibimos tu solicitud de eSIM <strong>{compania}</strong> por{" "}
            <strong>${precio} MXN</strong> (incluye recarga de ${recarga} MXN).
          </Text>
          <Text style={{ color: "#444444", fontSize: 16, lineHeight: "24px" }}>
            Estamos validando tu pago. En cuanto lo confirmemos recibirás tu código QR
            en este mismo correo para activar tu nueva línea.
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
