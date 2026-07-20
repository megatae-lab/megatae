import { Html, Head, Body, Container, Text, Preview, Img } from "@react-email/components";

interface Props {
  nombre: string;
  compania: string;
  logoUrl?: string;
}

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function RecordatorioActivacion({ nombre, compania, logoUrl }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Acción requerida: completa tu registro LMTR para tu eSIM {compania}</Preview>
      <Body style={{ fontFamily: font, backgroundColor: "#eef2f7", margin: 0, padding: "40px 16px" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>

          {/* Accent bar */}
          <div style={{ height: 5, background: "#d97706", borderRadius: "8px 8px 0 0" }} />

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
              Completa tu registro LMTR
            </Text>
            <Text style={{ color: "#4a5568", fontSize: 15, lineHeight: "24px", margin: "0 0 24px" }}>
              Hola <strong>{nombre}</strong>, aún no hemos podido confirmar que completaste el registro de tu línea <strong>{compania}</strong> ante el LMTR (Registro Nacional de Usuarios de Telecomunicaciones).
            </Text>

            {/* What is LMTR */}
            <div style={{ background: "#f7faff", border: "1px solid #d0e1fb", borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
              <Text style={{ color: "#718096", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 10px" }}>
                ¿Qué es el registro LMTR?
              </Text>
              <Text style={{ color: "#4a5568", fontSize: 14, lineHeight: "22px", margin: 0 }}>
                La Ley de Migración y Telecomunicaciones de México (LMTR) obliga a todos los usuarios de telefonía móvil a registrar sus datos personales ante su operadora. Sin este registro, tu línea puede ser suspendida.
              </Text>
            </div>

            {/* Steps */}
            <div style={{ background: "#fffdf7", border: "1px solid #fde68a", borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
              <Text style={{ color: "#92400e", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 12px" }}>
                Cómo completar tu registro
              </Text>
              <Text style={{ color: "#78350f", fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
                1. Ingresa al portal de registro de <strong>{compania}</strong>.
              </Text>
              <Text style={{ color: "#78350f", fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
                2. Proporciona tu nombre completo, CURP y número de línea.
              </Text>
              <Text style={{ color: "#78350f", fontSize: 14, lineHeight: "22px", margin: 0 }}>
                3. Confirma el registro — recibirás un SMS o correo de tu operadora.
              </Text>
            </div>

            {/* Warning */}
            <div style={{ background: "#fff8e1", border: "1px solid #fce082", borderRadius: 10, padding: "14px 20px" }}>
              <Text style={{ color: "#92400e", fontSize: 13, margin: 0, lineHeight: "20px" }}>
                <strong>Importante:</strong> Si tienes dudas sobre cómo completar el registro, responde a este correo y te orientamos paso a paso.
              </Text>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "#f7fafc", borderTop: "1px solid #e2e8f0", borderRadius: "0 0 8px 8px", padding: "20px 36px" }}>
            <Text style={{ color: "#a0aec0", fontSize: 11, margin: 0, lineHeight: "18px" }}>
              Megatae Global · Este recordatorio es requerido por la normativa LMTR vigente en México.
            </Text>
          </div>

        </Container>
      </Body>
    </Html>
  );
}
