interface Advantage {
    id: string;
    icon: string;
    title: string;
}

const advantages: Advantage[] = [
    {
        id: "ingresos",
        icon: "/assets/icon-billetera.png",
        title: "Genera ingresos extras",
    },
    {
        id: "companias",
        icon: "/assets/icon-telefono.png",
        title: "Recargas de las principales compañías",
    },
    {
        id: "seguro",
        icon: "/assets/icon-linea.png",
        title: "Plataforma segura y confiable",
    },
    {
        id: "rapido",
        icon: "/assets/icon-mano.png",
        title: "Servicio rápido y fácil de ofrecer",
    },
    {
        id: "horario",
        icon: "/assets/icon-tiempo.png",
        title: "El horario mas extenso del mercado",
    },
    {
        id: "clientes",
        icon: "/assets/icon-estrellas.png",
        title: "Atrae más clientes",
    },
];

export function AdvantagesSection() {
    return (
        <section className="relative overflow-hidden bg-[url('/assets/fondo-banner-2.png')] bg-cover bg-center">
            {/* Overlay azul */}
            <div className="absolute inset-0" />

            <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:flex-row lg:items-center lg:gap-16 lg:py-16">
                {/* Grid de ventajas */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:flex-1">
                    {advantages.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col  hover:bg-white/10 border-sky-400 items-center justify-center gap-3 rounded-lg border px-3 py-6 text-center sm:gap-4 sm:px-4 sm:py-8"
                        >
                            <img
                                src={item.icon}
                                alt={item.title}
                                className="h-16 w-16 object-contain sm:h-16 sm:w-16"
                            />
                            <p className="text-xs font-medium leading-snug text-white sm:text-sm">
                                {item.title}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Texto y CTA */}
                <div className="flex flex-col items-start gap-6 lg:w-95 lg:shrink-0">
                    <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                        Descubre las <br className="hidden sm:block" />
                        <span className="block">ventajas de</span>
                        <span className="block">vender recargar</span>
                    </h2>

                    <button
                        onClick={() => (window.location.href = "/registro-negocio")}
                        type="button"
                        className="rounded-lg bg-[#0A1F44] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0A1F44]/80 sm:text-base"
                    >
                        Me interesa
                    </button>
                </div>
            </div>
            <CtaBanner text="Quiero vender recargas electrónicas" />

        </section>
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

