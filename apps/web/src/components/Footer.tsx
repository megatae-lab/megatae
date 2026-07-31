import { useState } from "react";
import { AvisoPrivacidadModal } from "./AvisoPrivacidadModal";

export function Footer() {
  const [showAviso, setShowAviso] = useState(false);

  return (
    <>
      <AvisoPrivacidadModal
        isOpen={showAviso}
        onClose={() => setShowAviso(false)}
      />

      <footer className="bg-navy-950 border-t border-white/10 py-6 text-center text-white/50 text-sm">
        <p>2026 Megatae. Todos los derechos reservados.</p>

        <div className="mt-1 flex items-center justify-center gap-4">
          <a href="#" className="hover:text-white transition-colors">
            Términos y Condiciones
          </a>

          <span>·</span>

          <button
            type="button"
            onClick={() => setShowAviso(true)}
            className="hover:text-white transition-colors hover:cursor-pointer"
          >
            Ver aviso de privacidad
          </button>
        </div>
      </footer>
    </>
  );
}