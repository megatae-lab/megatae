import { useState } from "react";
import { api } from "../../lib/api.js";

export function LeadMagnet() {
  const [email, setEmail] = useState("");
  const [acepto, setAcepto] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

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
    <section className="bg-brand py-14 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-white/80 font-semibold text-sm uppercase tracking-widest mb-2">
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
            <div className="flex gap-2">
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
                className="bg-navy-900 hover:bg-navy-950 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl text-sm whitespace-nowrap transition-colors"
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
              Acepto recibir promociones y contenido publicitario.
            </label>

            {status === "error" && (
              <p className="text-white/80 text-xs">{errMsg}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
