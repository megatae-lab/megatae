import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import type { HeroFormState } from "../../../../types";

export function Hero() {
    const navigate = useNavigate();
    const [form, setForm] = useState<HeroFormState>({
        nombre: "",
        email: "",
        telefono: "",
        compania: "ATT",
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
        navigate("//v1/eSIM-Att/comprar", { state: form });
    }

    return (
        <section id="hero" className="relative bg-[url('/assets/fondo-banner-att.png')] bg-cover bg-center overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 bg-linear-to-br pointer-events-none" />
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #0057ff33 0%, transparent 60%)" }}
            />
            <CtaBanner text="Solicite aquí su eSIM gratis" />
            <img
                src="/assets/att_avatar.png"
                alt="Maxi"
                className="hidden md:block absolute bottom-0 left-[55%] -translate-x-1/2 lg:translate-x-[-45%] h-[110%] max-h-125 w-auto object-contain drop-shadow-2xl pointer-events-none select-none z-10"
            />

             <img
                src="/assets/logo_att.png"
                alt="Maxi"
                className="hidden md:block absolute top-20 left-[45%] -translate-x-1/2 lg:translate-x-[-45%] h-[15%] max-h-125 w-auto object-contain drop-shadow-2xl pointer-events-none select-none z-10"
            />
            <div className="relative mx-auto max-w-full px-4 py-3 md:py-7 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                {/* Copy izquierdo */}
                <div className="flex-2 basis-0 md:pl-6 min-w-0 md:min-w-64 text-center md:text-left z-20 md:mr-16">
                    <h2 className="inline-block bg-[#000000] text-write font-extrabold text-2xl md:text-3xl px-4 py-2 rounded-sm animate-floating shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
                        ¡eSIM AT&T GRATIS!
                    </h2>
                    <h1 className="text-3xl md:text-5xl lg:text-5xl px-5 mt-4 font-black text-white leading-tight">
                        Contectate sin limites
                    </h1>
                    <h1 className="text-3xl md:text-5xl lg:text-5xl px-5 mt-2 font-black text-white leading-tight">
                        con la mejor red
                    </h1>
                    <div className="hidden md:flex items-start gap-4 mt-3">
                        <p className="flex-1 text-white text-lg">
                            Activa tu eSIM AT&T al realizar una   <span className="text-white font-extrabold">recarga de $150 y recibe $200 de tiempo aire.</span>
                        </p>
                    </div>
                    <img
                        src="/assets/beneficios_att.png"
                        alt="eSIM"
                        className="hidden md:block mx-auto w-[90%] h-32 object-contain drop-shadow-2xl shrink-0"
                    />
                </div>

                <div className="hidden md:block flex-1" aria-hidden="true" />

                {/* Formulario derecho */}
                <div className="w-full max-w-sm md:pr-7 shrink-0 z-20">
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
                                <p className="text-sm mb-2 text-white/70">
                                    Compañía telefónica
                                </p>

                                <div className="w-full py-2.5 rounded-xl border border-brand bg-brand/20 text-white text-center font-semibold">
                                    ATT
                                </div>
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
                className={`w-full bg-navy-900 border rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none transition-colors ${error ? "border-red-500 focus:border-red-400" : "border-white/20 focus:border-brand"
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

