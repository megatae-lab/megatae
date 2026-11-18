import { Text, Button } from "@react-email/components";
import { RecargasLayout, Titulo, Parrafo, Caja, colors } from "./Layout.js";

interface Props {
  folio: string;
  nombre: string;
  nombreNegocio: string;
  usuario: string;
  contrasena: string;
  plataformaUrl?: string;
  logoUrl?: string;
}

const mono = "'Courier New', Courier, monospace";

export function CredencialesRecargas({ folio, nombre, nombreNegocio, usuario, contrasena, plataformaUrl, logoUrl }: Props) {
  return (
    <RecargasLayout preview="Tu acceso a la plataforma de recargas está listo" accent={colors.green} folio={folio} logoUrl={logoUrl}>
      <Titulo>¡Tu acceso está listo!</Titulo>
      <Parrafo>
        Hola <strong>{nombre}</strong>, ya dimos de alta a <strong>{nombreNegocio}</strong> en la plataforma de
        recargas de MEGATAE. Estos son tus datos de acceso:
      </Parrafo>

      <Caja titulo="Datos de acceso" fondo="#f0fdf4" borde="#bbf7d0">
        <Text style={{ color: colors.muted, fontSize: 12, margin: "0 0 2px" }}>Usuario</Text>
        <Text style={{ color: colors.navy, fontSize: 18, fontWeight: 700, fontFamily: mono, margin: "0 0 14px" }}>{usuario}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, margin: "0 0 2px" }}>Contraseña</Text>
        <Text style={{ color: colors.navy, fontSize: 18, fontWeight: 700, fontFamily: mono, margin: 0 }}>{contrasena}</Text>
      </Caja>

      <Caja titulo="Importante" fondo="#fffbeb" borde="#fde68a">
        <Text style={{ color: "#78350f", fontSize: 14, lineHeight: "22px", margin: 0 }}>
          Esta contraseña es temporal. La plataforma te pedirá cambiarla la primera vez que inicies sesión.
          No la compartas con nadie.
        </Text>
      </Caja>

      {plataformaUrl ? (
        <Button
          href={plataformaUrl}
          style={{ background: colors.navy, color: "#ffffff", borderRadius: 6, padding: "12px 20px", fontSize: 14, fontWeight: 700 }}
        >
          Entrar a la plataforma
        </Button>
      ) : null}
    </RecargasLayout>
  );
}
