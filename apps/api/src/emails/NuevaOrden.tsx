import { Html, Head, Body, Container, Text, Preview, Button, Link } from "@react-email/components";

// Alerta interna para el equipo de MEGATAE (no la ve el cliente). Diseño
// deliberadamente sobrio: se lee rápido desde el celular y prioriza el dato
// operativo (qué hay que hacer con esta orden) sobre la marca.
interface Props {
  folio: string;
  metodoPago: "TRANSFERENCIA" | "STRIPE";
  nombre: string;
  email: string;
  compania: string;
  lada?: string | null;
  precio: string;
  recarga: string;
  comprobanteUrl?: string | null;
  adminUrl?: string;
}

const font = "Helvetica, Arial, sans-serif";

export function NuevaOrden({ folio, metodoPago, nombre, email, compania, lada, precio, recarga, comprobanteUrl, adminUrl }: Props) {
  const esStripe = metodoPago === "STRIPE";
  const accion = esStripe
    ? "Pago con tarjeta confirmado por Stripe. Lista para activar."
    : "Pago por transferencia. Hay que validar el comprobante.";

  const filas: [string, string][] = [
    ["Folio", folio],
    ["Método de pago", esStripe ? "Tarjeta (Stripe)" : "Transferencia"],
    ["Compañía", compania],
    ["Precio", `$${precio} MXN (recarga $${recarga} MXN)`],
    ["LADA", lada ?? "—"],
    ["Cliente", nombre],
    ["Correo", email],
  ];

  return (
    <Html lang="es">
      <Head />
      <Preview>Nueva orden {folio} — eSIM {compania} ${precio}</Preview>
      <Body style={{ fontFamily: font, backgroundColor: "#eef2f7", margin: 0, padding: "32px 16px" }}>
        <Container style={{ maxWidth: 520, margin: "0 auto", background: "#ffffff", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ height: 5, background: esStripe ? "#16a34a" : "#f59e0b" }} />
          <div style={{ padding: "24px 28px" }}>
            <Text style={{ color: "#022554", fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
              Nueva orden de eSIM {compania}
            </Text>
            <Text style={{ color: "#475569", fontSize: 14, margin: "0 0 20px" }}>{accion}</Text>

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

            {comprobanteUrl ? (
              <Text style={{ fontSize: 14, margin: "16px 0 0" }}>
                <Link href={comprobanteUrl} style={{ color: "#1f66e6" }}>Ver comprobante de pago</Link>
              </Text>
            ) : null}

            {adminUrl ? (
              <Button
                href={adminUrl}
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
