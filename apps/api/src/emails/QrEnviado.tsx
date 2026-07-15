import { Html, Head, Body, Container, Heading, Text, Hr, Img, Link } from "@react-email/components";

interface Props {
  nombre: string;
  compania: string;
  dn: string;
  qrUrl: string;
  videoUrl?: string;
}

export function QrEnviado({ nombre, compania, dn, qrUrl, videoUrl }: Props) {
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
            ¡Tu eSIM {compania} está lista, {nombre}!
          </Heading>

          <Text style={{ color: "#444444", fontSize: 16, lineHeight: "24px" }}>
            Tu número asignado es: <strong>{dn}</strong>
          </Text>

          <Text style={{ color: "#444444", fontSize: 15, margin: "0 0 8px" }}>
            Escanea este código QR para activar tu línea:
          </Text>

          <div style={{ textAlign: "center", margin: "16px 0" }}>
            <Img
              src={qrUrl}
              alt="Código QR eSIM"
              width="220"
              height="220"
              style={{ borderRadius: 8, border: "1px solid #e5e5e5" }}
            />
          </div>

          {videoUrl && (
            <Text style={{ color: "#444444", fontSize: 15, lineHeight: "24px" }}>
              ¿No sabes cómo activarla?{" "}
              <Link href={videoUrl} style={{ color: "#0057ff" }}>
                Ve el video tutorial aquí
              </Link>
              .
            </Text>
          )}

          <div
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 8,
              padding: "12px 16px",
              margin: "20px 0",
            }}
          >
            <Text style={{ color: "#92400e", fontSize: 14, margin: 0 }}>
              <strong>Importante:</strong> Tienes <strong>24 horas</strong> para
              registrar tu línea con {compania}. Si no completas el registro en ese
              plazo, tu boleto de participación podría no ser válido.
            </Text>
          </div>

          <Hr style={{ borderColor: "#e5e5e5", margin: "24px 0" }} />
          <Text style={{ color: "#999999", fontSize: 12, margin: 0 }}>
            Megatae Global · Si no realizaste esta solicitud, ignora este mensaje.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
