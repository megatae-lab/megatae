import type { ReactNode } from "react";
import { Html, Head, Body, Container, Text, Preview, Img } from "@react-email/components";

// Marco común de los correos al negocio del módulo de recargas. Mismo
// lenguaje visual que los correos de eSIM (barra de acento, header navy,
// cuerpo blanco, footer con folio) sin copiar el layout completo en cada
// template.

export const font = "Helvetica, Arial, sans-serif";

export const colors = {
  navy: "#022554",
  text: "#4a5568",
  muted: "#718096",
  blue: "#1f66e6",
  red: "#dc2626",
  green: "#16a34a",
};

interface Props {
  preview: string;
  accent: string;
  folio: string;
  logoUrl?: string;
  children: ReactNode;
}

export function RecargasLayout({ preview, accent, folio, logoUrl, children }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ fontFamily: font, backgroundColor: "#eef2f7", margin: 0, padding: "40px 16px" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ height: 5, background: accent, borderRadius: "8px 8px 0 0" }} />

          <div style={{ background: colors.navy, padding: "24px 36px" }}>
            {logoUrl ? (
              <Img src={logoUrl} alt="MEGATAE" height={44} style={{ display: "block" }} />
            ) : (
              <>
                <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 800, margin: 0 }}>MEGATAE</Text>
                <Text style={{ color: "#7aa8e8", fontSize: 12, margin: "4px 0 0", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  Recargas
                </Text>
              </>
            )}
          </div>

          <div style={{ background: "#ffffff", padding: "36px 36px 28px" }}>{children}</div>

          <div style={{ background: "#f7fafc", borderTop: "1px solid #e2e8f0", borderRadius: "0 0 8px 8px", padding: "20px 36px" }}>
            <Text style={{ color: "#a0aec0", fontSize: 11, margin: 0, lineHeight: "18px" }}>
              Megatae Global · Folio {folio}
              <br />
              Si no realizaste este registro, ignora este mensaje.
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

export function Titulo({ children }: { children: ReactNode }) {
  return (
    <Text style={{ color: colors.navy, fontSize: 22, fontWeight: 700, margin: "0 0 8px", lineHeight: "30px" }}>
      {children}
    </Text>
  );
}

export function Parrafo({ children }: { children: ReactNode }) {
  return (
    <Text style={{ color: colors.text, fontSize: 15, lineHeight: "24px", margin: "0 0 20px" }}>{children}</Text>
  );
}

export function Caja({ titulo, fondo, borde, children }: { titulo: string; fondo: string; borde: string; children: ReactNode }) {
  return (
    <div style={{ background: fondo, border: `1px solid ${borde}`, borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 10px" }}>
        {titulo}
      </Text>
      {children}
    </div>
  );
}
