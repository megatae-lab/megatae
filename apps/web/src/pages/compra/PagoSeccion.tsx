import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Upload, Loader, CreditCard, Lock } from "lucide-react";
import { api } from "../../lib/api.js";
import { TRANSFERENCIA_HABILITADA } from "../../lib/features.js";
import type { CompaniaKey } from "../../types.js";
import type { CompaniaTheme } from "./Comprar.js";

// Sección de pago — antes era la página /pago (paso 2 separado). Ahora vive
// dentro de Comprar.tsx: aparece inline en cuanto los datos de arriba son
// válidos, sin salto de página. Recibe los datos ya validados como props en
// vez de leerlos de location.state.
// Nota: el resumen del pedido (plan, precio, etc.) ya NO se muestra aquí —
// se movió a Comprar.tsx, justo debajo del selector de plan.

interface PagoSeccionProps {
  theme: CompaniaTheme;
  nombre: string;
  email: string;
  compania: CompaniaKey;
  planId: number;
  lada?: string;
  estadoMx?: string;
  // El correo se valida en Comprar.tsx; aquí solo se usa para bloquear el
  // botón de "Pagar con tarjeta" hasta que el usuario lo llene bien.
  emailValido: boolean;
}

export function PagoSeccion({
  theme, nombre, email, compania, planId, lada, estadoMx,
  emailValido,
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
    if (!emailValido) return;
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
        className={`transition-colors ${theme.panelBorder} ${theme.panelTop}`}
      >
        <button
          type="button"
          onClick={handlePagarConTarjeta}
          disabled={payingWithCard || !emailValido}
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

        <SelloConfianzaPago theme={theme} />
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

function SelloConfianzaPago({ theme }: { theme: CompaniaTheme }) {
  return (
    <div className=" p-4 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <Lock className={`w-4 h-4 ${theme.text}`} strokeWidth={2} />
        <span className="text-white font-semibold text-sm">
          Pago seguro procesado por Stripe
        </span>
      </div>

      <span className="text-white/40 text-xs">
        Visa · Mastercard · Apple Pay · Google Pay
      </span>

      <div className="grid grid-cols-4 gap-2 w-[75%]">
        <div className="bg-white rounded-md h-8 flex items-center justify-center">
          <span className="text-[#1A1F71] font-black italic text-xs tracking-tight">
            VISA
          </span>
        </div>

        <div className="bg-white rounded-md h-8 flex items-center justify-center">
          <div className="flex items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] -mr-1.5" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90" />
          </div>
        </div>

        <div className="bg-white rounded-md h-8 flex items-center justify-center gap-1">
          <span className="text-black text-sm leading-none"></span>
          <span className="text-black font-semibold text-xs">Pay</span>
        </div>

        <div className="bg-white rounded-md h-8 flex items-center justify-center gap-1">
          <span className="font-bold text-xs">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          <span className="text-black font-semibold text-xs">Pay</span>
        </div>
      </div>

      <p className="text-white/30 text-[11px] text-center">
        Tu información está protegida y encriptada.
      </p>
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
