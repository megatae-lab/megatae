import { Text } from "@react-email/components";
import { RecargasLayout, Titulo, Parrafo, Caja, colors } from "./Layout.js";

interface Props {
  folio: string;
  nombre: string;
  observacion: string;
  montoMinimo: string;
  logoUrl?: string;
}

export function RegistroRecargasRechazado({ folio, nombre, observacion, montoMinimo, logoUrl }: Props) {
  return (
    <RecargasLayout preview="No pudimos verificar tu comprobante de pago" accent={colors.red} folio={folio} logoUrl={logoUrl}>
      <Titulo>Hubo un problema con tu pago</Titulo>
      <Parrafo>
        Hola <strong>{nombre}</strong>, revisamos el comprobante de tu registro para vender recargas y no
        pudimos verificarlo.
      </Parrafo>

      <Caja titulo="Motivo" fondo="#fff5f5" borde="#fed7d7">
        <div style={{ borderLeft: `3px solid ${colors.red}`, paddingLeft: 14 }}>
          <Text style={{ color: "#742a2a", fontSize: 14, lineHeight: "22px", margin: 0 }}>{observacion}</Text>
        </div>
      </Caja>

      <Caja titulo="¿Qué puedo hacer?" fondo="#f7faff" borde="#d0e1fb">
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
          · El depósito mínimo es de ${montoMinimo} MXN.
        </Text>
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
          · Asegúrate de que el comprobante sea legible y muestre el monto y la fecha.
        </Text>
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: "22px", margin: 0 }}>
          · Si crees que es un error, responde a este correo y te ayudamos.
        </Text>
      </Caja>
    </RecargasLayout>
  );
}
