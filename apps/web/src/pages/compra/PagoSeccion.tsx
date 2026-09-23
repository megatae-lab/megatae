import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Upload, Loader, CreditCard } from "lucide-react";
import { api } from "../../lib/api.js";
import { TRANSFERENCIA_HABILITADA } from "../../lib/features.js";
import type { CompaniaKey } from "../../types.js";
import type { CompaniaTheme } from "./Comprar.js";

// Sección de pago — antes era la página /pago (paso 2 separado). Ahora vive
// dentro de Comprar.tsx: aparece inline en cuanto los datos de arriba son
// válidos, sin salto de página. Recibe los datos ya validados como props en
// vez de leerlos de location.state.
const COMPANIA_LABEL: Record<CompaniaKey, string> = {
  ATT: "AT&T",
  MOVISTAR: "Movistar",
  BAIT: "Bait",
};

interface PagoSeccionProps {
  theme: CompaniaTheme;
  nombre: string;
  email: string;
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

export function PagoSeccion({
  theme, nombre, email, compania, planId, lada, estadoMx,
  planPrecio, planRecarga, planMegas, planDias, planDescripcion,
}: PagoSeccionProps) {
  const navigate = useNavigate();

  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [payingWithCard, setPayingWithCard] = useState(false);
  const [cardError, setCardError] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const { data: cuentas = [] } = useQuery({
    queryKey: ["cuentas"],
    queryFn: api.cuentas.list,
    enabled: TRANSFERENCIA_HABILITADA,
  });

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function handlePagarConTarjeta() {
    setCardError("");
    try {
      setPayingWithCard(true);
      const { url } = await api.solicitudes.stripeCheckout({
        nombre, email, compania, planId, lada, estadoMx,
      });
      // Redirect completo: Stripe hospeda el checkout, no es un fetch más.
      window.location.href = url;
    } catch (err) {
      setCardError((err as Error).message ?? "No se pudo iniciar el pago con tarjeta. Intenta de nuevo.");
      setPayingWithCard(false);
    }
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
        nombre, email, compania, planId, lada, estadoMx,
        comprobanteUrl: publicUrl,
      });

      navigate("/gracias", {
        state: { folio: result.publicCode, email, nombre, compania },
      });
    } catch (err) {
      setError((err as Error).message ?? "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pago con tarjeta / transferencia */}
      <div
        className={`bg-navy-800 border rounded-2xl p-6 shadow-2xl transition-colors border-t-4 ${theme.panelBorder} ${theme.panelTop}`}
      >
        <h2 className="text-white font-bold text-lg mb-3">Realiza tu pago</h2>

        {/* Resumen de la compra — recordatorio del plan elegido justo antes
            de pagar, ya que a esta altura el selector de arriba puede estar
            fuera de vista. */}
        {(planPrecio || planMegas != null || planDias != null || planDescripcion) && (() => {
          const bullets = (planDescripcion ?? "")
            .split("-")
            .map((s) => s.trim())
            .filter(Boolean);
          return (
            <div className={`border rounded-xl px-4 py-3 mb-4 transition-colors ${theme.panelBorder} bg-navy-900`}>
              <div className="flex items-center justify-between gap-4 mb-2">
                <div>
                  <p className={`text-xs uppercase tracking-widest mb-1 transition-colors ${theme.label}`}>
                    Resumen de tu compra · {COMPANIA_LABEL[compania]}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {planMegas != null && (
                      <span className="text-white font-bold text-lg">{planMegas} GB</span>
                    )}
                    {planDias != null && (
                      <span className={`text-sm transition-colors ${theme.label}`}>
                        {planMegas != null && "·"} {planDias} días
                      </span>
                    )}
                    {planRecarga && (
                      <span className={`text-sm transition-colors ${theme.label}`}>
                        · Recarga ${planRecarga} MXN
                      </span>
                    )}
                  </div>
                </div>
                {planPrecio && (
                  <p className="text-white font-black text-xl shrink-0">
                    ${planPrecio} <span className="text-xs font-normal text-white/40">MXN</span>
                  </p>
                )}
              </div>
              {bullets.length > 0 && (
                <ul className="flex flex-col gap-1 mt-1">
                  {bullets.map((b) => (
                    <li key={b} className={`flex items-center gap-2 text-xs transition-colors ${theme.label}`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })()}

        <p className={`text-sm mb-5 transition-colors ${theme.label}`}>
          {TRANSFERENCIA_HABILITADA
            ? "Paga con tarjeta al instante, o transfiere el monto exacto de tu plan y adjunta tu comprobante."
            : "Paga con tarjeta al instante."}
        </p>

        <button
          type="button"
          onClick={handlePagarConTarjeta}
          disabled={payingWithCard}
          className={`w-full disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2.5 ${theme.button}`}
        >
          {payingWithCard ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Redirigiendo a Stripe…
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" strokeWidth={2} />
              Pagar con tarjeta
            </>
          )}
        </button>
        <p className="text-white/30 text-xs text-center mt-1.5">
          Pago seguro procesado por Stripe. Se confirma automáticamente, sin subir comprobante.
        </p>

        {cardError && (
          <p className="mt-3 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {cardError}
          </p>
        )}

        {TRANSFERENCIA_HABILITADA && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs uppercase tracking-widest">o transferencia</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {cuentas.length === 0 ? (
              <p className="text-white/40 text-sm">Cargando cuentas…</p>
            ) : (
              <div className="flex flex-col gap-3">
                {cuentas.map((c) => (
                  <div
                    key={c.id}
                    className={`bg-navy-900 border rounded-xl p-4 transition-colors ${theme.panelBorder}`}
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
          </>
        )}
      </div>

      {/* Upload comprobante — solo aplica a transferencia */}
      {TRANSFERENCIA_HABILITADA && (
        <form
          onSubmit={handleSubmit}
          className={`bg-navy-800 border rounded-2xl p-6 shadow-2xl transition-colors border-t-4 ${theme.panelBorder} ${theme.panelTop}`}
        >
          <h2 className="text-white font-bold text-lg mb-1">Adjunta tu comprobante</h2>
          <p className={`text-sm mb-5 transition-colors ${theme.label}`}>
            Solo si transferiste. Sube la foto o PDF de tu transferencia (JPG, PNG o PDF, máx. 5 MB).
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
            className={`w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-3 transition-colors ${file ? `${theme.borderSelected} ${theme.bg}` : "border-white/20 hover:border-white/40"
              }`}
          >
            <Upload
              className={`w-8 h-8 ${file ? theme.text : "text-white/30"}`}
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
            className={`w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${theme.button}`}
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
      )}
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
  theme: CompaniaTheme;
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
          <Check className={`w-4 h-4 ${theme.text}`} />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
