type AvisoPrivacidadModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AvisoPrivacidadModal({
  isOpen,
  onClose,
}: AvisoPrivacidadModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand flex items-center justify-between px-6 py-4 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <img
              src="/assets/logo-megatae.png"
              alt="MEGATAE"
              className="h-8 w-auto object-contain"
            />

            <div className="w-px h-6 bg-white/30" />

            <p className="text-white text-sm">
              Aviso de Privacidad
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto p-6 text-sm text-gray-700 flex-1">

          <p className="mb-3">
            Con fundamento en los artículos 15 y 16 de la Ley Federal de
            Protección de Datos Personales en Posesión de Particulares hacemos
            de su conocimiento que <strong>TELENOR RED S.A. DE C.V.</strong> a
            través de su comercializadora <strong>MEGATAE</strong>, con domicilio
            en Adelita No. 54 Col. Benito Juárez Nezahualcóyotl, C.P. 57000 es
            responsable de recabar sus datos personales, del uso que se le dé a
            los mismos y de su protección.
          </p>

          <p className="mb-3">
            Su información personal será utilizada para las siguientes
            finalidades: proveer los servicios y productos que ha solicitado;
            notificarle sobre nuevos servicios o productos relacionados con los
            ya contratados o adquiridos; comunicarle cambios en los mismos;
            enviarle información publicitaria o promocional; elaborar estudios y
            programas necesarios para determinar hábitos de consumo; realizar
            evaluaciones periódicas de nuestros productos y servicios; evaluar
            la calidad del servicio que brindamos y cumplir con las obligaciones
            contraídas con usted.
          </p>

          <p className="mb-2 font-semibold text-gray-900">
            Para las finalidades antes mencionadas requerimos obtener:
          </p>

          <ul className="list-disc list-inside mb-3 space-y-1">
            <li>Nombre completo</li>
            <li>Nombre del comercio</li>
            <li>Dirección</li>
            <li>Correo electrónico</li>
            <li>RFC</li>
            <li>Teléfono fijo</li>
            <li>Identificación oficial</li>
          </ul>

          <p className="text-xs text-gray-500">
            <strong>Importante:</strong> Cualquier modificación a este Aviso de
            Privacidad podrá consultarse directamente en megatae.mx.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-brand text-white font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
