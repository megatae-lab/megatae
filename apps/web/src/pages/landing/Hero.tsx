import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.compania) return;
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

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
        {/* Copy izquierdo */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-brand-light font-bold text-lg mb-2">¡eSIM GRATIS!</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
            Más conexión
            <br />
            <span className="text-brand-light">menos complicaciones</span>
          </h1>
          <p className="mt-4 text-white/70 text-lg max-w-md mx-auto md:mx-0">
            Activa tu eSIM gratis al realizar una recarga de $200 y disfruta tu conexión al instante.
          </p>
          <div className="mt-0.5 hidden md:block">
            <img
              src="/assets/esim-stack.png"
              alt="eSIM"
              className="ml-auto w-52 h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Formulario derecho */}
        <div className="w-full max-w-sm shrink-0">
          <div className="bg-navy-950 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-white font-bold text-xl mb-5">Comienza tu experiencia</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField
                label="Nombre Completo"
                type="text"
                value={form.nombre}
                onChange={(v) => setForm((p) => ({ ...p, nombre: v }))}
                required
              />
              <FormField
                label="Correo Electrónico"
                type="email"
                value={form.email}
                onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                required
              />
              <FormField
                label="Número Telefónico"
                type="tel"
                maxLength={10}
                value={form.telefono}
                onChange={(v) => setForm((p) => ({ ...p, telefono: v }))}
                required
              />

              {/* Selector de compañía */}
              <div>
                <p className="text-white/70 text-sm mb-2">Compañía telefónica</p>
                <div className="flex flex-col gap-2">
                  {COMPANIAS.map((c) => (
                    <label
                      key={c.key}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${form.compania === c.key
                        ? "border-brand bg-brand/20 text-white"
                        : "border-white/20 bg-white/5 text-white/80 hover:border-white/40"
                        }`}
                    >
                      <input
                        type="radio"
                        name="compania"
                        value={c.key}
                        checked={form.compania === c.key}
                        onChange={() => setForm((p) => ({ ...p, compania: c.key }))}
                        className="hidden"
                      />
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.compania === c.key ? "border-brand" : "border-white/40"
                          }`}
                      >
                        {form.compania === c.key && (
                          <span className="w-2 h-2 rounded-full bg-brand" />
                        )}
                      </span>
                      <span className="font-medium text-sm">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!form.compania || !form.nombre || !form.email || !form.telefono}
                className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors mt-1"
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
  required,
  maxLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm mb-1">{label}</label>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand transition-colors"
      />
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

