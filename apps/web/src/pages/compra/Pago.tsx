import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Upload, Loader, CreditCard, ArrowLeft } from "lucide-react";
import { api } from "../../lib/api.js";
import { Stepper, type StepperTheme } from "../../components/Stepper.js";
import type { CompaniaKey } from "../../types.js";

const STEPS = ["Tus datos", "Pago", "Confirmación"];

interface CompaniaTheme {
  border: string;
  borderSelected: string;
  bg: string;
  text: string;
  ring: string;
  button: string;
  dot: string;
  panelBorder: string;
  panelTop: string;
  hr: string;
  label: string;
  stepRing: string;
}

const THEME: Record<CompaniaKey, CompaniaTheme> = {
  ATT: {
    border: "border-[#9f62d9]",
    borderSelected: "border-[#9f62d9]",
    bg: "bg-[#9f62d9]/20",
    text: "text-[#9f62d9]",
    ring: "focus:border-[#9f62d9]",
    button: "bg-[#6B2FA0] hover:bg-[#5a2788]",
    dot: "bg-[#9f62d9]",
    panelBorder: "border-[#9f62d9]/30",
    panelTop: "border-t-[#9f62d9]",
    hr: "border-[#9f62d9]/20",
    label: "text-[#c39ee8]",
    stepRing: "ring-[#9f62d9]/30",
  },
  MOVISTAR: {
    border: "border-[#3B82F6]",
    borderSelected: "border-[#3B82F6]",
    bg: "bg-[#3B82F6]/20",
    text: "text-[#3B82F6]",
    ring: "focus:border-[#3B82F6]",
    button: "bg-[#1D5FC4] hover:bg-[#1a52a8]",
    dot: "bg-[#3B82F6]",
    panelBorder: "border-[#3B82F6]/30",
    panelTop: "border-t-[#3B82F6]",
    hr: "border-[#3B82F6]/20",
    label: "text-[#7eb0f7]",
    stepRing: "ring-[#3B82F6]/30",
  },
  BAIT: {
    border: "border-[#FFE600]",
    borderSelected: "border-[#FFE600]",
    bg: "bg-[#FFE600]/20",
    text: "text-[#D4A800]",
    ring: "focus:border-[#FFE600]",
    button: "bg-[#D4A800] hover:bg-[#b89100]",
    dot: "bg-[#FFE600]",
    panelBorder: "border-[#FFE600]/30",
    panelTop: "border-t-[#FFE600]",
    hr: "border-[#FFE600]/20",
    label: "text-[#F0C800]",
    stepRing: "ring-[#FFE600]/30",
  },
};

interface PagoState {
  nombre: string;
  email: string;
  telefono: string;
  compania: CompaniaKey;
  planId: number;
  lada?: string;
  estadoMx?: string;
  planPrecio?: string;
  planRecarga?: string;
  planMegas?: number | null;
  planDias?: number | null;
  planDescripcion?: string | null;
}

export function Pago() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PagoState | null;

  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!state?.compania || !state?.planId) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  const { data: cuentas = [] } = useQuery({
    queryKey: ["cuentas"],
    queryFn: api.cuentas.list,
  });

  const theme: CompaniaTheme | null = state?.compania ? THEME[state.compania] : null;

  const stepperTheme: StepperTheme | undefined = theme
    ? {
      circle: theme.dot,
      ring: theme.stepRing,
      label: theme.text,
      line: theme.dot,
    }
    : undefined;

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Adjunta tu comprobante de pago.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no puede superar 5 MB.");
      return;
    }

    if (!state) return;

    try {
      setUploading(true);

      const { uploadUrl, publicUrl } = await api.solicitudes.presignedUrl(file.type);

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Error al subir el comprobante. Intenta de nuevo.");

      const result = await api.solicitudes.create({
        nombre: state.nombre,
        email: state.email,
        telefono: state.telefono,
        compania: state.compania,
        planId: state.planId,
        lada: state.lada,
        estadoMx: state.estadoMx,
        comprobanteUrl: publicUrl,
      });

      navigate("/gracias", {
        state: {
          id: result.id,
          email: state.email,
          nombre: state.nombre,
          compania: state.compania,
        },
      });
    } catch (err) {
      setError((err as Error).message ?? "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  if (!state) return null;

  return (
    <div className="min-h-screen bg-navy-900 py-10 px-4">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={() =>
            navigate("/comprar", {
              state: {
                nombre: state.nombre,
                email: state.email,
                telefono: state.telefono,
                compania: state.compania,
                planId: state.planId,
              },
            })
          }
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Cambiar plan
        </button>

        <Stepper steps={STEPS} current={1} theme={stepperTheme} />

        <div className="flex flex-col gap-4">
          {/* Resumen del plan */}
          {(state.planPrecio || state.planMegas || state.planDias || state.planDescripcion) && (() => {
            const bullets = (state.planDescripcion ?? "")
              .split("-")
              .map((s) => s.trim())
              .filter(Boolean);
            return (
              <div
                className={`border rounded-2xl px-5 py-4 transition-colors ${
                  theme ? `${theme.panelBorder} bg-navy-800` : "border-white/10 bg-navy-800"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className={`text-xs uppercase tracking-widest mb-1 ${theme ? theme.label : "text-white/40"}`}>
                      Tu plan
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {state.planMegas != null && (
                        <span className="text-white font-bold text-lg">{state.planMegas} GB</span>
                      )}
                      {state.planDias != null && (
                        <span className={`text-sm ${theme ? theme.label : "text-white/50"}`}>
                          {state.planMegas != null && "·"} {state.planDias} días
                        </span>
                      )}
                      {state.planRecarga && (
                        <span className={`text-sm ${theme ? theme.label : "text-white/50"}`}>
                          · Recarga ${state.planRecarga} MXN
                        </span>
                      )}
                    </div>
                  </div>
                  {state.planPrecio && (
                    <p className="text-white font-black text-2xl shrink-0">
                      ${state.planPrecio} <span className="text-sm font-normal text-white/40">MXN</span>
                    </p>
                  )}
                </div>
                {bullets.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {bullets.map((b) => (
                      <li key={b} className={`flex items-center gap-2 text-xs ${theme ? theme.label : "text-white/50"}`}>
                        <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}

          {/* Cuentas bancarias */}
          <div
            className={`bg-navy-800 border rounded-2xl p-6 shadow-2xl transition-colors border-t-4 ${theme ? `${theme.panelBorder} ${theme.panelTop}` : "border-white/10 border-t-brand"
              }`}
          >
            <h2 className="text-white font-bold text-lg mb-1">Paso 1 — Realiza tu pago</h2>
            <p className={`text-sm mb-5 transition-colors ${theme ? theme.label : "text-white/50"}`}>
              Transfiere exactamente el monto de tu plan a una de estas cuentas.
            </p>

            {cuentas.length === 0 ? (
              <p className="text-white/40 text-sm">Cargando cuentas…</p>
            ) : (
              <div className="flex flex-col gap-3">
                {cuentas.map((c) => (
                  <div
                    key={c.id}
                    className={`bg-navy-900 border rounded-xl p-4 transition-colors ${theme ? theme.panelBorder : "border-white/10"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-semibold text-sm">{c.banco}</p>
                      <p className="text-white/50 text-xs">{c.titular}</p>
                    </div>
                    {c.cuenta && (
                      <CopyRow
                        label="Cuenta"
                        value={c.cuenta}
                        copied={copied === `cuenta-${c.id}`}
                        onCopy={() => copy(c.cuenta!, `cuenta-${c.id}`)}
                        theme={theme}
                      />
                    )}
                    {c.clabe && (
                      <CopyRow
                        label="CLABE"
                        value={c.clabe}
                        copied={copied === `clabe-${c.id}`}
                        onCopy={() => copy(c.clabe!, `clabe-${c.id}`)}
                        theme={theme}
                      />
                    )}
                  </div>
                ))}

                {import.meta.env.VITE_MERCADOPAGO_URL && (
                  <>
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-white/30 text-xs uppercase tracking-widest">o</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <a
                      href={import.meta.env.VITE_MERCADOPAGO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 bg-[#009ee3] hover:bg-[#007bbf] transition-colors rounded-xl px-4 py-3.5"
                    >
                      <CreditCard className="w-5 h-5 text-white shrink-0" strokeWidth={2} />
                      <span className="text-white font-bold text-sm">Pagar con Mercado Pago</span>
                    </a>
                    <p className="text-white/30 text-xs text-center -mt-1">
                      Abre Mercado Pago en una nueva pestaña. Vuelve aquí para adjuntar tu comprobante.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Upload comprobante */}
          <form
            onSubmit={handleSubmit}
            className={`bg-navy-800 border rounded-2xl p-6 shadow-2xl transition-colors border-t-4 ${theme ? `${theme.panelBorder} ${theme.panelTop}` : "border-white/10 border-t-brand"
              }`}
          >
            <h2 className="text-white font-bold text-lg mb-1">Paso 2 — Adjunta tu comprobante</h2>
            <p className={`text-sm mb-5 transition-colors ${theme ? theme.label : "text-white/50"}`}>
              Sube la foto o PDF de tu transferencia. Solo JPG, PNG o PDF (máx. 5 MB).
            </p>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-3 transition-colors ${file
                ? theme
                  ? `${theme.borderSelected} ${theme.bg}`
                  : "border-brand/60 bg-brand/10"
                : "border-white/20 hover:border-white/40"
                }`}
            >
              <Upload
                className={`w-8 h-8 ${file ? (theme ? theme.text : "text-brand") : "text-white/30"
                  }`}
                strokeWidth={1.5}
              />
              {file ? (
                <span className="text-white/80 text-sm font-medium">{file.name}</span>
              ) : (
                <span className="text-white/40 text-sm">Toca para seleccionar archivo</span>
              )}
            </button>

            {error && (
              <p className="mt-3 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className={`w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${theme ? theme.button : "bg-brand hover:bg-brand-dark"
                }`}
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Enviando solicitud…
                </>
              ) : (
                "Enviar solicitud"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
  theme,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  theme: CompaniaTheme | null;
}) {
  return (
    <div className="flex items-center justify-between mt-1.5">
      <div>
        <span className="text-white/40 text-xs">{label} </span>
        <span className="text-white/80 text-sm font-mono">{value}</span>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="ml-2 shrink-0 text-white/40 hover:text-white transition-colors"
        title={`Copiar ${label}`}
      >
        {copied ? (
          <Check className={`w-4 h-4 ${theme ? theme.text : "text-brand"}`} />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}