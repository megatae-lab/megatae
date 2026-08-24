export function HeroRecargas() {
    return (
        <>
            <section
                id="hero"
                className="relative bg-[url('/assets/banner-registro.png')] bg-cover bg-center overflow-hidden"
            >
                <img
                    src="/assets/avatar-recargas.png"
                    alt="Recargas"
                    className="hidden md:block absolute bottom-0 left-[70%] translate-x-1/2 lg:translate-x-[-45%] h-full w-auto object-contain drop-shadow-2xl pointer-events-none select-none z-10"
                />

                {/* Fondo decorativo */}
                <div className="absolute inset-0 bg-linear-to-br pointer-events-none" />
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #0057ff33 0%, transparent 60%)" }}
                />

                {/* Banner superior */}
                <CtaBanner text="Quiero vender recargas electrónicas" />

                <div className="relative mx-auto max-w-7xl px-6 sm:px-14 mb-8 sm:mb-14 py-6 md:py-7 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    {/* Copy izquierdo */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="max-w-4xl flex flex-col items-center md:items-start">
                            <h1 className="text-4xl font-extrabold leading-none text-white sm:text-6xl mb-0">
                                Haz que tu negocio
                            </h1>
                            <h2 className="mt-0 pt-0 text-5xl font-extrabold leading-none text-[#3B9CFF] sm:text-9xl">
                                crezca
                            </h2>

                            <p className="mt-3 text-sm text-slate-200 sm:text-xl">
                                Ofrece los servicios que tus clientes buscan todos los días
                            </p>

                            <div className="mt-6 flex flex-col gap-4 w-full max-w-xs">
                                {/* Sección 1: Recargas Telefónicas */}
                                <div className="flex items-center hover:bg-white/10 gap-4 rounded-lg border border-white/80 bg-transparent px-4 py-3 text-white">
                                    <img
                                        src="/assets/icon-recargas.png"
                                        alt="Recargas Telefónicas"
                                        className="h-8 w-8 object-contain"
                                    />
                                    <span className="text-base sm:text-lg font-medium">Recargas Telefónicas</span>
                                </div>

                                {/* Sección 2: Pago de servicios */}
                                <div className="flex items-center hover:bg-white/10 gap-4 rounded-lg border border-white/80 bg-transparent px-4 py-3 text-white">
                                    <img
                                        src="/assets/icon-pagos.png"
                                        alt="Pago de servicios"
                                        className="h-8 w-8 object-contain"
                                    />
                                    <span className="text-base sm:text-lg font-medium">Pago de servicios</span>
                                </div>

                                {/* Sección 3: Pines electrónicos */}
                                <div className="flex items-center hover:bg-white/10 gap-4 rounded-lg border border-white/80 bg-transparent px-4 py-3 text-white">
                                    <img
                                        src="/assets/icon-tarjeta.png"
                                        alt="Pines electrónicos"
                                        className="h-8 w-8 object-contain"
                                    />
                                    <span className="text-base sm:text-lg font-medium">Pines electrónicos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banner inferior */}
                <CtaBanner text="Quiero vender recargas electrónicas" />
            </section>
        </>
    );
}

function CtaBanner({ text }: { text: string }) {
    return (
        <div className="relative z-10 bg-brand py-2 text-center">
            <button
                onClick={() => (window.location.href = "/registro-negocio")}
                className="text-white text-sm font-medium underline underline-offset-2 hover:text-white/80 transition-colors"
            >
                {text}
            </button>
        </div>
    );
}