import { useState } from "react";
import { api } from "../../lib/api.js";

function AvisoModal({ onClose }: { onClose: () => void }) {
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
            <img src="/assets/logo-megatae.png" alt="MEGATAE" className="h-8 w-auto object-contain" />
            <div className="w-px h-6 bg-white/30" />
            <p className="text-white text-sm">Aviso de Privacidad</p>
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

        <p className="mb-3">Con fundamento en los artículos 15 y 16 de la Ley Federal de Protección de Datos Personales en Posesión de Particulares hacemos de su conocimiento que <strong>TELENOR RED S.A. DE C.V.</strong> a través de su comercializadora <strong>MEGATAE</strong>, con domicilio en Adelita No 54 Col. Benito Juárez Nezahualcóyotl, C.P. 57000 es responsable de recabar sus datos personales, del uso que se le dé a los mismos y de su protección.</p>

        <p className="mb-3">Su información personal será utilizada para las siguientes finalidades: proveer los servicios y productos que ha solicitado; notificarle sobre nuevos servicios o productos que tengan relación con los ya contratados o adquiridos; comunicarle sobre cambios en los mismos; también para enviarle por correo electrónico información publicitaria o promocional de nuestros servicios. Elaborar estudios y programas que son necesarios para determinar hábitos de consumo; realizar evaluaciones periódicas de nuestros productos y servicios a efecto de mejorar la calidad de los mismos; evaluar la calidad del servicio que brindamos, y en general, para dar cumplimiento a las obligaciones que hemos contraído con usted.</p>

        <p className="mb-2 font-semibold text-gray-900">Para las finalidades antes mencionadas, requerimos obtener los siguientes datos personales:</p>
        <ul className="list-disc list-inside mb-3 space-y-1">
          <li>Nombre completo</li>
          <li>Nombre del comercio</li>
          <li>Dirección</li>
          <li>Correo electrónico</li>
          <li>Datos fiscales (RFC)</li>
          <li>Teléfono fijo</li>
          <li>Foto de Identificación oficial</li>
        </ul>

        <p className="mb-3">No obstante, lo anterior, usted podrá modificar o, en su caso, solicitar que sus datos sean eliminados de la base de datos en el momento que así lo solicite vía correo electrónico a <a href="mailto:administracion@megataeglobal.com" className="text-blue-600 underline">administracion@megataeglobal.com</a></p>

        <p className="text-xs text-gray-500"><strong>Importante:</strong> Cualquier modificación a este Aviso de Privacidad podrá consultarlo directo en megatae.mx.</p>
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

export function LeadMagnet() {
  const [email, setEmail] = useState("");
  const [acepto, setAcepto] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [showAviso, setShowAviso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acepto) return;
    setStatus("loading");
    try {
      await api.leads.create(email, acepto);
      setStatus("ok");
      setEmail("");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Error desconocido");
      setStatus("error");
    }
  }

  return (
    <>
    {showAviso && <AvisoModal onClose={() => setShowAviso(false)} />}
    <section className="bg-brand py-14 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-white font-semibold text-xl uppercase tracking-widest mb-2">
          Déjanos tu email y desbloquea
        </p>
        <h2 className="text-white font-black text-3xl md:text-4xl mb-6">
          una promoción especial
        </h2>

        {status === "ok" ? (
          <div className="bg-white/20 rounded-2xl py-6 px-8 text-white font-semibold text-lg">
            ¡Listo! Te avisaremos muy pronto.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Escribe tu email"
                required
                className="flex-1 bg-white/10 border border-white/30 text-white placeholder-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading" || !acepto}
                className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors"
              >
                {status === "loading" ? "..." : "Registrarme"}
              </button>
            </div>

            <label className="flex items-start gap-2 text-white/80 text-xs text-left cursor-pointer">
              <input
                type="checkbox"
                checked={acepto}
                onChange={(e) => setAcepto(e.target.checked)}
                className="mt-0.5 shrink-0 accent-white"
              />
              Acepto recibir promociones y contenido publicitario conforme al{" "}
              <button
                type="button"
                onClick={() => setShowAviso(true)}
                className="underline font-semibold hover:text-white transition-colors"
              >
                aviso de privacidad
              </button>.
            </label>

            {status === "error" && (
              <p className="text-white/80 text-xs">{errMsg}</p>
            )}
          </form>
        )}
      </div>
    </section>
    </>
  );
}
