import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Upload, Loader } from "lucide-react";
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
    button: "bg-[#9f62d9] hover:bg-[#8753b8]",
    dot: "bg-[#9f62d9]",
    panelBorder: "border-[#9f62d9]/30",
    panelTop: "border-t-[#9f62d9]",
    hr: "border-[#9f62d9]/20",
    label: "text-[#c39ee8]",
    stepRing: "ring-[#9f62d9]/30",
  },
  MOVISTAR: {
    border: "border-green-500",
    borderSelected: "border-green-500",
    bg: "bg-green-500/20",
    text: "text-green-400",
    ring: "focus:border-green-500",
    button: "bg-green-500 hover:bg-green-600",
    dot: "bg-green-500",
    panelBorder: "border-green-500/30",
    panelTop: "border-t-green-500",
    hr: "border-green-500/20",
    label: "text-green-300",
    stepRing: "ring-green-500/30",
  },
  BAIT: {
    border: "border-yellow-400",
    borderSelected: "border-yellow-400",
    bg: "bg-yellow-400/20",
    text: "text-yellow-400",
    ring: "focus:border-yellow-400",
    button: "bg-yellow-400 hover:bg-yellow-500",
    dot: "bg-yellow-400",
    panelBorder: "border-yellow-400/30",
    panelTop: "border-t-yellow-400",
    hr: "border-yellow-400/20",
    label: "text-yellow-300",
    stepRing: "ring-yellow-400/30",
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
        <Stepper steps={STEPS} current={1} theme={stepperTheme} />

        <div className="flex flex-col gap-4">
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