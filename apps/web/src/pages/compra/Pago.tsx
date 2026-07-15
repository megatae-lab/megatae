import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Upload, Loader } from "lucide-react";
import { api } from "../../lib/api.js";
import { Stepper } from "../../components/Stepper.js";
import type { CompaniaKey } from "../../types.js";

const STEPS = ["Tus datos", "Pago", "Confirmación"];

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

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
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
        state: { id: result.id, email: state.email, nombre: state.nombre },
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
        <Stepper steps={STEPS} current={1} />

        <div className="flex flex-col gap-4">
          {/* Cuentas bancarias */}
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-white font-bold text-lg mb-1">Paso 1 — Realiza tu pago</h2>
            <p className="text-white/50 text-sm mb-5">
              Transfiere exactamente el monto de tu plan a una de estas cuentas.
            </p>

            {cuentas.length === 0 ? (
              <p className="text-white/40 text-sm">Cargando cuentas…</p>
            ) : (
              <div className="flex flex-col gap-3">
                {cuentas.map((c) => (
                  <div
                    key={c.id}
                    className="bg-navy-900 border border-white/10 rounded-xl p-4"
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
                      />
                    )}
                    {c.clabe && (
                      <CopyRow
                        label="CLABE"
                        value={c.clabe}
                        copied={copied === `clabe-${c.id}`}
                        onCopy={() => copy(c.clabe!, `clabe-${c.id}`)}
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
            className="bg-navy-800 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <h2 className="text-white font-bold text-lg mb-1">Paso 2 — Adjunta tu comprobante</h2>
            <p className="text-white/50 text-sm mb-5">
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
              className={`w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-3 transition-colors ${
                file
                  ? "border-brand/60 bg-brand/10"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              <Upload className={`w-8 h-8 ${file ? "text-brand" : "text-white/30"}`} strokeWidth={1.5} />
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
              className="w-full mt-5 bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
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
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
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
          <Check className="w-4 h-4 text-brand" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
