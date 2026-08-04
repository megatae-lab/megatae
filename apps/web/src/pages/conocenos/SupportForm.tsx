import { useState } from "react";

const STEPS = [
    { img: "/assets/ingresos.png" },
    { img: "/assets/pagos.png" },
    { img: "/assets/negocio.png" },
];

// Reemplaza esto con tu access key de https://web3forms.com
const WEB3FORMS_ACCESS_KEY = "55d1cd28-a935-46e5-aabb-9407186b8511";

export function SopportForm() {
    const [loading, setLoading] = useState(false);

    const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.append("access_key", WEB3FORMS_ACCESS_KEY);

        // Opcional: personaliza el asunto del correo que recibirás
        formData.append("subject", "Nuevo mensaje de contacto - Sitio web");

        try {
            setLoading(true);

            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert("Mensaje enviado correctamente.");
                form.reset();
            } else {
                throw new Error(data.message || "Error desconocido");
            }
        } catch (error) {
            console.error(error);
            alert("Ocurrió un error al enviar el mensaje.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            id="Carousel"
            className="relative bg-navy-900 overflow-hidden"
        >
            <div className="absolute inset-0 bg-linear-to-br pointer-events-none" />

            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 50%, #0057ff33 0%, transparent 60%)",
                }}
            />

            <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-16 lg:py-24">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-10 lg:gap-12 items-center justify-items-center">
                    {STEPS.map((step, i) => (
                        <div
                            key={i}
                            className="flex w-full justify-center"
                        >
                            <img
                                src={step.img}
                                alt=""
                                className="w-full max-w-52 sm:max-w-75 md:max-w-full h-auto object-contain drop-shadow-lg"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[url('/assets/banner-formulario.jpg')] bg-cover bg-center py-8 sm:py-10 md:py-12 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="flex justify-center order-2 md:order-1">
                        <img
                            src="/assets/contactanos.png"
                            alt="Contáctanos"
                            className="w-full max-w-70 sm:max-w-sm md:max-w-md lg:max-w-full h-auto"
                        />
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="bg-black rounded-3xl p-8 shadow-2xl max-w-xl mx-auto">
                            <h2 className="text-2xl font-bold text-white mb-8">
                                Estamos para ayudarte
                            </h2>

                            <form
                                onSubmit={sendEmail}
                                className="space-y-1"
                            >
                                <div>
                                    <label className="block text-gray-300 mb-2">
                                        Nombre completo
                                    </label>

                                    <input
                                        type="text"
                                        name="nombre"
                                        required
                                        className="w-full rounded-xl bg-[#12346B] border border-blue-700 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2">
                                        Correo electrónico
                                    </label>

                                    <input
                                        type="email"
                                        name="correo"
                                        required
                                        className="w-full rounded-xl bg-[#12346B] border border-blue-700 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2">
                                        Número telefónico
                                    </label>

                                    <input
                                        type="tel"
                                        name="telefono"
                                        maxLength={10}
                                        pattern="[0-9]{10}"
                                        required
                                        className="w-full rounded-xl bg-[#12346B] border border-blue-700 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2">
                                        Escríbenos tu mensaje
                                    </label>

                                    <textarea
                                        name="mensaje"
                                        rows={5}
                                        required
                                        className="w-full rounded-xl bg-[#12346B] border border-blue-700 px-4 py-1 text-white resize-none outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] transition rounded-xl py-3 text-xl font-semibold text-white disabled:opacity-50"
                                >
                                    {loading ? "Enviando..." : "Enviar"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}