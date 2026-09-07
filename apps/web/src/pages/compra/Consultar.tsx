import { useState, type FormEvent } from "react";
import { Search, Loader } from "lucide-react";
import { api } from "../../lib/api.js";
import type { EstadoSolicitud, SolicitudPublica } from "../../types.js";

// Copy orientado al cliente — distinto del que usa el panel admin (ese es
// operativo, este explica qué significa cada estado desde afuera).
const ESTADO_COPY: Record<EstadoSolicitud, string> = {
  RECIBIDA: "Recibimos tu solicitud, en espera de confirmación de pago.",
  REVISION_PAGO: "Estamos revisando tu comprobante de pago.",
  PAGO_RECHAZADO: "Tu comprobante de pago no pudo verificarse — revisa tu correo.",
  PAGO_VALIDADO: "Tu pago fue validado, estamos preparando tu eSIM.",
  EN_ACTIVACION: "Estamos activando tu eSIM.",
  QR_ENVIADO: "¡Tu código QR ya fue enviado a tu correo!",
  ACTIVADA: "Tu eSIM está activada.",
  CANCELADA: "Esta solicitud fue cancelada.",
};

export function Consultar() {
  const [folio, setFolio] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<SolicitudPublica | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResultado(null);
    setLoading(true);
    try {
      const data = await api.solicitudes.consultar(folio.trim(), email.trim());
      setResultado(data);
    } catch {
      // Respuesta genérica a propósito — no distingue folio inexistente de
      // correo que no coincide (ver docs/ARCHITECTURE.md).
      setError("No encontramos una solicitud con ese folio y correo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 py-10 px-4">
      <div className="mx-auto max-w-md">
        <div className="bg-navy-800 border border-white/10 border-t-4 border-t-brand rounded-2xl p-6 shadow-2xl">
          <h1 className="text-white font-bold text-xl mb-1">Consulta tu solicitud</h1>
          <p className="text-white/50 text-sm mb-5">
            Ingresa tu folio y el correo con el que compraste.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Folio</label>
              <input
                type="text"
                required
                value={folio}
                onChange={(e) => setFolio(e.target.value)}
                placeholder="MT-XXXXXXXXXX"
                className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Correo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 disabled:opacity-50 disabled:cursor-not-allowed bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Buscando…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Consultar
                </>
              )}
            </button>
          </form>

          {resultado && (
            <div className="mt-5 bg-navy-900 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-1">
                Folio <span className="font-mono text-white/70">{resultado.publicCode}</span>
              </p>
              <p className="text-white font-semibold text-sm mb-2">{resultado.nombre}</p>
              <p className="text-white/70 text-sm">{ESTADO_COPY[resultado.estado]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
