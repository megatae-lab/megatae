import { Text } from "@react-email/components";
import { RecargasLayout, Titulo, Parrafo, Caja, colors } from "./Layout.js";

interface Props {
  folio: string;
  nombre: string;
  nombreNegocio: string;
  logoUrl?: string;
}

export function RegistroRecargasRecibido({ folio, nombre, nombreNegocio, logoUrl }: Props) {
  return (
    <RecargasLayout preview={`Recibimos el registro de ${nombreNegocio}`} accent={colors.blue} folio={folio} logoUrl={logoUrl}>
      <Titulo>Recibimos tu registro</Titulo>
      <Parrafo>
        Hola <strong>{nombre}</strong>, gracias por registrar <strong>{nombreNegocio}</strong> para vender recargas
        con MEGATAE. Ya tenemos tus datos y tu comprobante de pago.
      </Parrafo>

      <Caja titulo="Qué sigue" fondo="#f7faff" borde="#d0e1fb">
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
          1. Validamos tu comprobante de pago.
        </Text>
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
          2. Damos de alta tu negocio en la plataforma de recargas.
        </Text>
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: "22px", margin: 0 }}>
          3. Te enviamos a este correo tu usuario y contraseña de acceso.
        </Text>
      </Caja>

      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: "20px", margin: 0 }}>
        Guarda tu folio <strong>{folio}</strong> por si necesitas contactarnos.
      </Text>
    </RecargasLayout>
  );
}
