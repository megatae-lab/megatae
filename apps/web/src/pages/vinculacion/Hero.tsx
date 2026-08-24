import { useState } from "react";

interface Operador {
    nombre: string;
    logoSrc: string;
    url: string;
}

const operadores: Operador[] = [
    {
        nombre: "Movistar",
        logoSrc: "/assets/movistar-sim.png",
        url: "https://registro-telefonica-movistar.hubox.com/registro",
    },
    {
        nombre: "Bait",
        logoSrc: "/assets/bait-sim.png",
        url: "https://rnu.altanredes.com/bait/vinculatulinea",
    },
    {
        nombre: "AT&T",
        logoSrc: "/assets/att-sim.png",
        url: "https://www.att.com.mx/vinculatulinea/",
    },
   ];

export function Hero() {
    return (
        <section
            id="hero"
            className="relative bg-[url('/assets/banner-registro.png')] bg-cover bg-center overflow-hidden"
        >
            {/* Fondo decorativo */}
            <div className="absolute inset-0 bg-linear-to-br pointer-events-none" />
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #0057ff33 0%, transparent 60%)" }}
            />

            {/* Banner superior */}
            <CtaBanner text="Registra tu línea aquí" />

            <div className="relative w-full overflow-hidden rounded-none bg-linear-to-br px-6 py-10 sm:px-10 lg:px-16">
                {/* Fondo decorativo con opacidad */}
                <div
                    className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-10"
                    style={{ backgroundImage: "url('/images/pharmacy-shelf-bg.jpg')" }}
                />

                <div className="relative z-10 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
                    <div className="max-w-xl">
                        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                            Registra tu línea
                        </h1>
                        <h2 className="mt-1 text-3xl font-extrabold leading-tight text-[#3B9CFF] sm:text-4xl">
                            de forma rápida y segura
                        </h2>

                        <p className="mt-4 text-sm text-slate-200 sm:text-base">
                            Realiza el registro de tu línea en unos
                            <br className="hidden sm:block" /> cuantos pasos y evita bloqueos
                        </p>

                        <div className="mt-6 flex items-start gap-3 rounded-md border border-white/25 px-4 py-3">
                            <svg
                                className="mt-0.5 h-5 w-5 shrink-0 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m0 3.75h.007M4.98 20.5h14.04c1.6 0 2.6-1.73 1.8-3.12L13.8 4.62c-.8-1.39-2.8-1.39-3.6 0L2.98 17.38c-.8 1.4.2 3.12 1.8 3.12z"
                                />
                            </svg>
                            <p className="text-xs leading-snug text-slate-100 sm:text-sm">
                                <span className="font-semibold text-white">Aviso importante</span>
                                <br />
                                A partir del 9 de enero del 2026, todas las líneas telefónicas deben
                                registrarse obligatoriamente para su activación. Este requisito es
                                indispensable según disposición oficial.
                            </p>
                        </div>
                    </div>

                    {/*selección de operador */}
                    <div className="w-full max-w-2xl">
                        <h3 className="text-center text-lg font-bold text-white sm:text-3xl">
                            Selecciona tu operador
                            <br />
                            para comenzar
                        </h3>
                        <div className="mt-3 hidden h-px w-full bg-white/30 sm:block" />

                        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {operadores.map((op) => (
                                <a
                                    key={op.nombre}
                                    href={op.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Registrar línea con ${op.nombre}`}
                                    className="flex flex-col items-center rounded-xl bg-white px-3 py-4 shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B9CFF]"
                                >
                                    <OperadorLogo operador={op} />

                                    <span className="mt-2 text-sm font-bold text-[#0A1F44]">
                                        {op.nombre}
                                    </span>

                                    <span className="mt-2 rounded bg-[#0A1F44] px-2 py-1 text-center text-[10px] font-medium leading-tight text-white">
                                        Accede al
                                        <br />
                                        registro oficial
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Banner inferior */}
            <CtaBanner text="Registra tu línea con tu compañia favorita" />
        </section>
    );
}


function OperadorLogo({ operador }: { operador: Operador }) {
    const [errored, setErrored] = useState(false);

    return (
        <div
            className="flex h-32 w-48 items-center justify-center overflow-hidden rounded-lg"
        >
            {!errored ? (
                <img
                    src={operador.logoSrc}
                    alt={operador.nombre}
                    className="h-full w-full object-contain p-2"
                    onError={() => setErrored(true)}
                />
            ) : (
                <SimIconFallback />
            )}
        </div>
    );
}

function SimIconFallback() {
    return (
        <svg
            className="h-7 w-7 text-white/90"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M4 8h16" />
            <rect x="7" y="11" width="6" height="4" rx="0.5" />
        </svg>
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