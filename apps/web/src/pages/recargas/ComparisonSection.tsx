interface ComparisonRow {
    recargas: string;
    otros: string;
    megatae: string;
}

const rows: ComparisonRow[] = [
    { recargas: "$100", otros: "$5", megatae: "$7" },
    { recargas: "$200", otros: "$10", megatae: "$14" },
    { recargas: "$500", otros: "$25", megatae: "$35" },
    { recargas: "$1.000", otros: "$50", megatae: "$70" },
    { recargas: "$1.500", otros: "$75", megatae: "$105" },
    { recargas: "$2.000", otros: "$100", megatae: "$140" },
    { recargas: "$2.500", otros: "$125", megatae: "$175" },
    { recargas: "$3.000", otros: "$150", megatae: "$210" },
];

export function ComparisonSection() {
    return (
        <section className="bg-[#0A2A6B] px-4 py-12 sm:px-8 lg:px-16 lg:py-16">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
                {/* Columna izquierda: texto + gráfica */}
                <div className="flex w-full flex-col items-center justify-center text-center lg:w-2/5">
                    <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                        Incrementa tus ingresos con{" "}
                        <span className="text-[#3B9CFF]">grandes comisiones</span>
                    </h2>

                    <img
                        src="/assets/grafica.png"
                        alt="Gráfica de ingresos crecientes"
                        className="mx-auto h-64 w-64 object-contain"
                    />

                    <button
                        type="button"
                        onClick={() => (window.location.href = "/registro-negocio")}
                        className="rounded-lg bg-[#3B9CFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3B9CFF]/80 sm:text-base"
                    >
                        Me interesa
                    </button>
                </div>
                {/* Columna derecha: tabla comparativa */}
                <div className="w-full rounded-2xl bg-[#2E7DE1] p-1.5 shadow-xl lg:w-3/5">
                    <h3 className="px-4 py-4 text-center text-lg font-extrabold text-white sm:text-2xl">
                        Compara y gana más con Megatae
                    </h3>

                    <div className="overflow-hidden rounded-xl bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-105 border-collapse text-center">
                                <thead>
                                    <tr>
                                        <th className="bg-[#0A1F44] px-3 py-3 text-xs font-bold text-white sm:text-base">
                                            Recargas
                                        </th>
                                        <th className="bg-[#0A1F44] px-3 py-3 text-xs font-bold text-white sm:text-base">
                                            Otros Negocios
                                        </th>
                                        <th className="bg-[#3B9CFF] px-3 py-3 text-xs font-bold text-white sm:text-base">
                                            Con Megatae
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr
                                            key={row.recargas}
                                            className={i % 2 === 0 ? "bg-white" : "bg-[#EAF3FF]"}
                                        >
                                            <td className="px-3 py-3 text-sm font-bold text-[#0A1F44] sm:text-base">
                                                {row.recargas}
                                            </td>
                                            <td className="px-3 py-3 text-sm font-bold text-[#0A1F44] sm:text-base">
                                                {row.otros}
                                            </td>
                                            <td className="px-3 py-3 text-sm font-bold text-[#3B9CFF] sm:text-base">
                                                {row.megatae}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}