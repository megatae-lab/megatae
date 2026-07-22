import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import type { CompaniaKey, HeroFormState } from "../../types.js";

const COMPANIAS: { key: CompaniaKey; label: string }[] = [
  { key: "MOVISTAR", label: "Movistar" },
  { key: "BAIT", label: "Bait" },
  { key: "ATT", label: "AT&T" },
];

export function Hero() {
  const navigate = useNavigate();
  const [form, setForm] = useState<HeroFormState>({
    nombre: "",
    email: "",
    telefono: "",
    compania: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.nombre.trim()) next.nombre = "Escribe tu nombre completo.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Escribe un correo válido (ej. nombre@correo.com).";
    if (!form.telefono || form.telefono.length < 10)
      next.telefono = "Escribe tu número a 10 dígitos.";
    if (!form.compania) next.compania = "Elige una compañía para continuar.";

    if (Object.keys(next).length > 0) { setErrors(next); return; }
    setErrors({});
    navigate("/comprar", { state: form });
  }

  return (
    <section id="hero" className="relative bg-[url('/assets/fondo-banner-1.png')] bg-cover bg-center overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-linear-to-br pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #0057ff33 0%, transparent 60%)" }}
      />

      {/* Banner superior */}
      <CtaBanner text="Solicite aquí su eSIM gratis" />

      <div className="relative mx-auto max-w-7xl px-4 py-3 md:py-7 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        {/* Copy izquierdo */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-brand-light font-bold text-base md:text-lg mb-1 md:mb-2">¡eSIM GRATIS!</p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
            Más conexión
            <br />
            <span className="text-brand-light">menos complicaciones</span>
          </h1>
          <div className="hidden md:flex items-start gap-4 mt-3">
            <p className="flex-1 text-white/70 text-lg">
              Activa tu eSIM gratis al realizar una recarga de $200 y disfruta tu conexión al instante.
            </p>
            <img
              src="/assets/esim-stack.png"
              alt="eSIM"
              className="w-44 h-auto object-contain drop-shadow-2xl shrink-0"
            />
          </div>
        </div>

        {/* Formulario derecho */}
        <div className="w-full max-w-sm shrink-0">
          <div className="bg-black border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl">
            <h2 className="text-white font-bold text-lg md:text-xl mb-4">Comienza tu experiencia</h2>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 md:gap-4">
              <FormField
                label="Nombre Completo"
                type="text"
                value={form.nombre}
                onChange={(v) => { setForm((p) => ({ ...p, nombre: v })); setErrors((p) => ({ ...p, nombre: "" })); }}
                error={errors.nombre}
              />
              <FormField
                label="Correo Electrónico"
                type="email"
                value={form.email}
                onChange={(v) => { setForm((p) => ({ ...p, email: v })); setErrors((p) => ({ ...p, email: "" })); }}
                error={errors.email}
              />
              <FormField
                label="Número Telefónico"
                type="tel"
                maxLength={10}
                value={form.telefono}
                onChange={(v) => {
                  const digits = v.replace(/\D/g, "").slice(0, 10);
                  setForm((p) => ({ ...p, telefono: digits }));
                  setErrors((p) => ({ ...p, telefono: "" }));
                }}
                error={errors.telefono}
              />

              {/* Selector de compañía */}
              <div>
                <p className={`text-sm mb-2 ${errors.compania ? "text-red-400" : "text-white/70"}`}>
                  Compañía telefónica
                </p>
                <div className="flex gap-2">
                  {COMPANIAS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => { setForm((p) => ({ ...p, compania: c.key })); setErrors((p) => ({ ...p, compania: "" })); }}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                        form.compania === c.key
                          ? "border-brand bg-brand/20 text-white"
                          : errors.compania
                          ? "border-red-500 bg-white/5 text-white/60"
                          : "border-white/20 bg-white/5 text-white/60 hover:border-white/40"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                {errors.compania && (
                  <p className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.compania}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition-colors mt-1"
              >
                Continuar
              </button>
              <p className="text-white/40 text-xs text-center">
                No compartimos tu información con terceros.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Banner inferior */}
      <CtaBanner text="Activa tu eSIM con tu compañía favorita" />
    </section>
  );
}

function FormField({
  label,
  type,
  value,
  onChange,
  maxLength,
  error,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  error?: string;
}) {
  return (
    <div>
      <label className={`block text-sm mb-1 ${error ? "text-red-400" : "text-white/70"}`}>{label}</label>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-navy-900 border rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none transition-colors ${
          error ? "border-red-500 focus:border-red-400" : "border-white/20 focus:border-brand"
        }`}
      />
      {error && (
        <p className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function CtaBanner({ text }: { text: string }) {
  return (
    <div className="relative z-10 bg-brand py-2 text-center">
      <button
        onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
        className="text-white text-sm font-medium underline underline-offset-2 hover:text-white/80 transition-colors"
      >
        {text}
      </button>
    </div>
  );
}

