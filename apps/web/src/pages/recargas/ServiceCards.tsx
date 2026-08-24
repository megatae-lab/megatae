interface Service {
    id: string;
    image: string;
    title: string;
    description: string;
}

const services: Service[] = [
    {
        id: "recargas",
        image: "/assets/tienda-2.png",
        title: "Recargas Telefónicas",
        description:
            "Ofrece recargas electrónicas en tu negocio y haz que tus ventas crezcan, ¡Desde tu celular o tu computadora!",
    },
    {
        id: "pagos",
        image: "/assets/farmacia-2.png",
        title: "Pago de servicios",
        description:
            "Ofrece a tus clientes el pago de sus servicios ¡Cada pago te deja una comisión!",
    },
    {
        id: "pines",
        image: "/assets/papeleria.png",
        title: "Pines digitales",
        description:
            "Vende pines digitales para videojuegos, streaming, entretenimiento y mas. ¡Cada venta suma a tus ganancias!",
    },
];

export function ServiceCards() {
    return (
        <section className="bg-[#0A2A6B] px-4 py-10 sm:px-8 sm:py-14 lg:px-16">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className="flex flex-col overflow-hidden rounded-2xl bg-[#2E7DE1] shadow-lg"
                    >
                        {/* Imagen */}
                        <div className="relative h-48 w-full sm:h-56 lg:h-64">
                            <img
                                src={service.image}
                                alt={service.title}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Contenido */}
                        <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
                            <h3 className="text-2xl font-extrabold text-white sm:text-3xl">
                                {service.title}
                            </h3>
                            <p className="text-sm text-white/90 sm:text-base">
                                {service.description}
                            </p>
                            <button
                                type="button"
                                onClick={() => (window.location.href = "/registro-negocio")}
                                className="mt-2 rounded-lg bg-[#0A1F44] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0A1F44]/80 sm:text-base"
                            >
                                Me interesa
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}