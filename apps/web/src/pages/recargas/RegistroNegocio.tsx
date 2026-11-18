import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Upload, Loader, CheckCircle2, Store, Landmark } from "lucide-react";
import { api } from "../../lib/api.js";
import { AvisoPrivacidadModal } from "../../components/AvisoPrivacidadModal.js";


const GIRO_OTRO = "OTRO";
const MAX_FILE_BYTES = 5 * 1024 * 1024;

type Campo = "nombreCompleto" | "email" | "telefono" | "nombreNegocio" | "giro" | "giroOtro" | "comprobante" | "aviso";

interface FormState {
  nombreCompleto: string;
  email: string;
  telefono: string;
  nombreNegocio: string;
  giro: string;
  giroOtro: string;
}

const EMPTY: FormState = {
  nombreCompleto: "",
  email: "",
  telefono: "",
  nombreNegocio: "",
  giro: "",
  giroOtro: "",
};

function soloDigitos(v: string) {
  return v.replace(/\D/g, "");
}

function validar(f: FormState, file: File | null, aviso: boolean): Partial<Record<Campo, string>> {
  const e: Partial<Record<Campo, string>> = {};
  if (f.nombreCompleto.trim().length < 3) e.nombreCompleto = "Escribe tu nombre completo";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Escribe un correo válido";
  if (soloDigitos(f.telefono).length !== 10) e.telefono = "Escribe un número de 10 dígitos";
  if (f.nombreNegocio.trim().length < 2) e.nombreNegocio = "Escribe el nombre de tu negocio";
  if (!f.giro) e.giro = "Selecciona el giro de tu negocio";
  if (f.giro === GIRO_OTRO && f.giroOtro.trim().length < 3) e.giroOtro = "Especifica el giro de tu negocio";
  if (!file) e.comprobante = "Adjunta tu comprobante de pago";
  else if (file.size > MAX_FILE_BYTES) e.comprobante = "El archivo no puede superar 5 MB";
  if (!aviso) e.aviso = "Debes aceptar el aviso de privacidad";
  return e;
}

export function RegistroNegocio() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [aviso, setAviso] = useState(false);
  const [showAviso, setShowAviso] = useState(false);
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [folio, setFolio] = useState<string | null>(null);

  const { data: config, isLoading, isError } = useQuery({
    queryKey: ["registros-recargas", "config"],
    queryFn: api.registrosRecargas.config,
  });

  const errores = validar(form, file, aviso);
  const err = (c: Campo) => (intentado ? errores[c] : undefined);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIntentado(true);
    setError("");
    if (Object.keys(errores).length > 0 || !file) return;

    try {
      setEnviando(true);
      const { uploadUrl, publicUrl } = await api.registrosRecargas.presignedUrl(file.type);
      const upload = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!upload.ok) throw new Error("Error al subir el comprobante. Intenta de nuevo.");

      const result = await api.registrosRecargas.create({
        nombreCompleto: form.nombreCompleto.trim(),
        email: form.email.trim(),
        telefono: soloDigitos(form.telefono),
        nombreNegocio: form.nombreNegocio.trim(),
        giro: form.giro,
        giroOtro: form.giro === GIRO_OTRO ? form.giroOtro.trim() : undefined,
        comprobanteUrl: publicUrl,
      });
      setFolio(result.publicCode);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError((e as Error).message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (folio) {
    return <Confirmacion folio={folio} email={form.email.trim()} nombreNegocio={form.nombreNegocio.trim()} />;
  }

  const minimo = config ? `$${config.montoMinimo.toLocaleString("es-MX")} MXN` : "";

  return (
    <section className="bg-navy-900 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-5">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Registra tu negocio</h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base">
            Llena tus datos, haz tu depósito y te enviamos tu usuario y contraseña por correo.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Datos */}
          <div className="bg-navy-800 border border-white/10 border-t-4 border-t-brand rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-5">
              <Store className="w-5 h-5 text-brand-light" strokeWidth={1.75} />
              <h2 className="text-white font-bold text-lg">Datos del negocio</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Nombre completo" value={form.nombreCompleto} onChange={(v) => set("nombreCompleto", v)}
                  error={err("nombreCompleto")} autoComplete="name" maxLength={120} />
              </div>
              <Input label="Correo electrónico" type="email" value={form.email} onChange={(v) => set("email", v)}
                error={err("email")} autoComplete="email" maxLength={160}
                hint="Aquí te llegarán tu usuario y contraseña" />
              <Input label="Número telefónico" type="tel" value={form.telefono}
                onChange={(v) => set("telefono", v.replace(/[^\d\s()-]/g, ""))}
                error={err("telefono")} autoComplete="tel" maxLength={16} placeholder="10 dígitos"
                hint="Debera contar con WhatsApp" />
              <div className="sm:col-span-2">
                <Input label="Nombre del negocio" value={form.nombreNegocio} onChange={(v) => set("nombreNegocio", v)}
                  error={err("nombreNegocio")} autoComplete="organization" maxLength={120} />
              </div>

              <div className={form.giro === GIRO_OTRO ? "" : "sm:col-span-2"}>
                <label className={`block text-sm mb-1 ${err("giro") ? "text-red-400" : "text-white/70"}`}>
                  Giro del negocio
                </label>
                <select
                  value={form.giro}
                  onChange={(e) => set("giro", e.target.value)}
                  disabled={isLoading}
                  className={`w-full bg-navy-900 border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none transition-colors ${err("giro") ? "border-red-500" : "border-white/20 focus:border-brand"
                    } ${form.giro ? "" : "text-white/40"}`}
                >
                  <option value="" disabled>
                    {isLoading ? "Cargando…" : "Selecciona una opción"}
                  </option>
                  {config?.giros.map((g) => (
                    <option key={g.clave} value={g.clave} className="text-white">
                      {g.etiqueta}
                    </option>
                  ))}
                </select>
                <FieldError msg={err("giro")} />
              </div>

              {form.giro === GIRO_OTRO && (
                <Input label="¿Cuál?" value={form.giroOtro} onChange={(v) => set("giroOtro", v)}
                  error={err("giroOtro")} maxLength={80} placeholder="Ej. Lavandería" />
              )}
            </div>
          </div>

          {/* Pago */}
          <div className="bg-navy-800 border border-white/10 border-t-4 border-t-brand rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-5 h-5 text-brand-light" strokeWidth={1.75} />
              <h2 className="text-white font-bold text-lg">Realiza tu depósito</h2>
            </div>
            <p className="text-white/50 text-sm mb-4">Transfiere a cualquiera de estas cuentas y adjunta tu comprobante.</p>

            {config && (
              <div className="bg-brand/10 border border-brand/30 rounded-xl px-4 py-3 mb-4 text-center">
                <p className="text-white/60 text-xs">Depósito mínimo</p>
                <p className="text-white font-black text-2xl">{minimo}</p>
                <p className="text-white/40 text-xs">Puedes depositar más si lo deseas</p>
              </div>
            )}

            {isError ? (
              <p className="text-red-400 text-sm">No pudimos cargar las cuentas. Recarga la página.</p>
            ) : isLoading ? (
              <p className="text-white/40 text-sm">Cargando cuentas…</p>
            ) : config && config.cuentas.length === 0 ? (
              <p className="text-yellow-300 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                Por el momento no hay cuentas disponibles. Intenta más tarde.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {config?.cuentas.map((c) => (
                  <div key={c.id} className="bg-navy-900 border border-white/15 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-semibold text-sm">{c.banco}</p>
                      <p className="text-white/50 text-xs">{c.titular}</p>
                    </div>
                    {c.cuenta && (
                      <CopyRow label="Cuenta" value={c.cuenta} copied={copied === `cuenta-${c.id}`}
                        onCopy={() => copy(c.cuenta!, `cuenta-${c.id}`)} />
                    )}
                    {c.clabe && (
                      <CopyRow label="CLABE" value={c.clabe} copied={copied === `clabe-${c.id}`}
                        onCopy={() => copy(c.clabe!, `clabe-${c.id}`)} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5">
              <p className={`text-sm mb-1 ${err("comprobante") ? "text-red-400" : "text-white/70"}`}>
                Comprobante de pago <span className="text-white/40">(JPG, PNG o PDF, máx. 5 MB)</span>
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
                className={`w-full border-2 border-dashed rounded-xl py-7 flex flex-col items-center gap-2 transition-colors ${file ? "border-brand bg-brand/10" : err("comprobante") ? "border-red-500" : "border-white/20 hover:border-white/40"
                  }`}
              >
                <Upload className={`w-7 h-7 ${file ? "text-brand-light" : "text-white/30"}`} strokeWidth={1.5} />
                <span className={file ? "text-white/80 text-sm font-medium" : "text-white/40 text-sm"}>
                  {file ? file.name : "Toca para seleccionar archivo"}
                </span>
              </button>
              <FieldError msg={err("comprobante")} />
            </div>
          </div>

          {/* Aviso + envío */}
          <div>
            <label className="flex items-start gap-2.5 text-sm text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={aviso}
                onChange={(e) => setAviso(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand"
              />
              <span>
                Acepto el{" "}
                <button type="button" onClick={() => setShowAviso(true)} className="text-brand-light underline underline-offset-2">
                  aviso de privacidad
                </button>
              </span>
            </label>
            <FieldError msg={err("aviso")} />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}
          {intentado && Object.keys(errores).length > 0 && (
            <p className="text-red-400 text-sm text-center">Revisa los campos marcados en rojo.</p>
          )}

          <button
            type="submit"
            disabled={enviando || isLoading}
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {enviando ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Enviando registro…
              </>
            ) : (
              "Enviar registro"
            )}
          </button>
        </form>
      </div>

      <AvisoPrivacidadModal isOpen={showAviso} onClose={() => setShowAviso(false)} />
    </section>
  );
}

function Confirmacion({ folio, email, nombreNegocio }: { folio: string; email: string; nombreNegocio: string }) {
  return (
    <section className="bg-navy-900 py-14">
      <div className="mx-auto max-w-lg px-5">
        <div className="bg-navy-800 border border-white/10 border-t-4 border-t-brand rounded-2xl p-8 text-center shadow-2xl">
          <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="text-white font-extrabold text-2xl mb-2">¡Recibimos tu registro!</h1>
          <p className="text-white/60 text-sm mb-6">
            Vamos a validar tu pago y a dar de alta <strong className="text-white">{nombreNegocio}</strong>. Te enviaremos
            tu usuario y contraseña a <strong className="text-white">{email}</strong>.
          </p>
          <div className="bg-navy-900 border border-white/15 rounded-xl px-4 py-3 mb-6">
            <p className="text-white/50 text-xs">Tu folio</p>
            <p className="text-white font-mono font-bold text-xl tracking-wide">{folio}</p>
          </div>
          <ol className="text-left text-white/60 text-sm flex flex-col gap-2 mb-6">
            <li>1. Validamos tu comprobante de pago.</li>
            <li>2. Damos de alta tu negocio en la plataforma.</li>
            <li>3. Recibes tu usuario y contraseña por correo. Al entrar, la plataforma te pedirá cambiar la contraseña.</li>
          </ol>
          <Link to="/vende-recargas" className="text-brand-light text-sm underline underline-offset-2">
            Volver a Vende recargas
          </Link>
        </div>
      </div>
    </section>
  );
}

function Input({
  label, value, onChange, error, type = "text", hint, placeholder, autoComplete, maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className={`block text-sm mb-1 ${error ? "text-red-400" : "text-white/70"}`}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={`w-full bg-navy-900 border rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none transition-colors ${error ? "border-red-500 focus:border-red-400" : "border-white/20 focus:border-brand"
          }`}
      />
      {error ? <FieldError msg={error} /> : hint ? <p className="text-white/40 text-xs mt-1">{hint}</p> : null}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-400 text-xs mt-1">{msg}</p>;
}

function CopyRow({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between mt-1.5">
      <div>
        <span className="text-white/40 text-xs">{label} </span>
        <span className="text-white/80 text-sm font-mono">{value}</span>
      </div>
      <button type="button" onClick={onCopy} className="ml-2 shrink-0 text-white/40 hover:text-white transition-colors" title={`Copiar ${label}`}>
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
