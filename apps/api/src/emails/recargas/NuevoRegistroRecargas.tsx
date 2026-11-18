import { Html, Head, Body, Container, Text, Preview, Button, Link } from "@react-email/components";

// Alerta interna para el equipo (no la ve el negocio). Mismo formato sobrio
// que NuevaOrden.tsx.
interface Props {
  folio: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  nombreNegocio: string;
  giro: string;
  montoMinimo: string;
  comprobanteUrl: string;
  adminUrl?: string;
}

const font = "Helvetica, Arial, sans-serif";

export function NuevoRegistroRecargas(p: Props) {
  const filas: [string, string][] = [
    ["Folio", p.folio],
    ["Negocio", p.nombreNegocio],
    ["Giro", p.giro],
    ["Contacto", p.nombreCompleto],
    ["Correo", p.email],
    ["Teléfono", p.telefono],
    ["Depósito mínimo", `$${p.montoMinimo} MXN`],
  ];

  return (
    <Html lang="es">
      <Head />
      <Preview>Nuevo registro de recargas {p.folio} — {p.nombreNegocio}</Preview>
      <Body style={{ fontFamily: font, backgroundColor: "#eef2f7", margin: 0, padding: "32px 16px" }}>
        <Container style={{ maxWidth: 520, margin: "0 auto", background: "#ffffff", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ height: 5, background: "#f59e0b" }} />
          <div style={{ padding: "24px 28px" }}>
            <Text style={{ color: "#022554", fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
              Nuevo registro para vender recargas
            </Text>
            <Text style={{ color: "#475569", fontSize: 14, margin: "0 0 20px" }}>
              Pago por transferencia. Hay que validar el comprobante y dar de alta al negocio.
            </Text>

            <table role="presentation" width="100%" style={{ borderCollapse: "collapse", fontSize: 14 }}>
              <tbody>
                {filas.map(([etiqueta, valor]) => (
                  <tr key={etiqueta}>
                    <td style={{ color: "#64748b", padding: "6px 0", width: 140, verticalAlign: "top" }}>{etiqueta}</td>
                    <td style={{ color: "#0f172a", padding: "6px 0", fontWeight: 600 }}>{valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Text style={{ fontSize: 14, margin: "16px 0 0" }}>
              <Link href={p.comprobanteUrl} style={{ color: "#1f66e6" }}>Ver comprobante de pago</Link>
            </Text>

            {p.adminUrl ? (
              <Button
                href={p.adminUrl}
                style={{ background: "#022554", color: "#ffffff", borderRadius: 6, padding: "12px 20px", fontSize: 14, fontWeight: 700, marginTop: 24 }}
              >
                Abrir en el panel admin
              </Button>
            ) : null}
          </div>
        </Container>
      </Body>
    </Html>
  );
}
