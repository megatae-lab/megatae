import { Html, Head, Body, Container, Text, Hr, Preview, Img } from "@react-email/components";

interface Props {
  nombre: string;
  logoUrl?: string;
}

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function FueraDeHorario({ nombre, logoUrl }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu solicitud está en buenas manos — te atendemos en horario laboral</Preview>
      <Body style={{ fontFamily: font, backgroundColor: "#eef2f7", margin: 0, padding: "40px 16px" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>

          {/* Card */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>

            {/* Header */}
            <div style={{ backgroundColor: "#0f1b35", padding: "28px 40px", textAlign: "center" }}>
              {logoUrl ? (
                <Img src={logoUrl} alt="MEGATAE" width={140} style={{ margin: "0 auto" }} />
              ) : (
                <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 900, margin: 0 }}>MEGATAE</Text>
              )}
            </div>

            {/* Accent bar */}
            <div style={{ height: 4, backgroundColor: "#f59e0b" }} />

            {/* Body */}
            <div style={{ padding: "36px 40px" }}>
              <Text style={{ fontSize: 22, fontWeight: 800, color: "#0f1b35", margin: "0 0 8px" }}>
                Hola, {nombre}
              </Text>
              <Text style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.6, margin: "0 0 20px" }}>
                Recibimos tu solicitud y está en buenas manos. En este momento estamos fuera de nuestro horario de atención, pero la revisaremos tan pronto como estemos disponibles.
              </Text>

              {/* Horario */}
              <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "20px 24px", margin: "0 0 20px" }}>
                <Text style={{ fontSize: 13, fontWeight: 700, color: "#92400e", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>
                  Horario de atención
                </Text>
                <Text style={{ fontSize: 14, color: "#78350f", margin: "0 0 6px" }}>
                  <strong>Lunes a sábado:</strong> 8:00 am – 11:00 pm
                </Text>
                <Text style={{ fontSize: 14, color: "#78350f", margin: 0 }}>
                  <strong>Domingos:</strong> 9:00 am – 11:00 pm
                </Text>
              </div>

              <Text style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
                No necesitas hacer nada más. En cuanto iniciemos operaciones procesaremos tu solicitud y recibirás una actualización por correo.
              </Text>
            </div>

            <Hr style={{ borderColor: "#e5e7eb", margin: 0 }} />

            {/* Footer */}
            <div style={{ padding: "20px 40px", textAlign: "center" }}>
              <Text style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                MEGATAE eSIM · megatae.mx
              </Text>
            </div>
          </div>

        </Container>
      </Body>
    </Html>
  );
}
