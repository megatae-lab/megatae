import { motion } from "framer-motion";

export function Hero() {

    return (
        <section id="hero" className="relative bg-[url('/assets/banner_megatae.jpg')] bg-cover bg-center overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 bg-linear-to-br pointer-events-none" />
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #0057ff33 0%, transparent 60%)" }}
            />

            {/* Banner superior */}
            {/* <CtaBanner text="Únete a Megatae" /> */}

            <div className="relative mx-auto max-w-7xl px-4 py-10 md:py-7 flex flex-col items-center justify-center text-center">

                {/* Logo */}
                <motion.img
                    src="/assets/logo.png"
                    alt="eSIM"
                    className="w-56 sm:w-72 md:w-80 lg:w-96 h-auto object-contain drop-shadow-2xl mb-6 mt-11"
                    initial={{ opacity: 0, y: -90, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: "easeOut",
                    }}
                />

                {/* Título */}
                <motion.h1
                    className="text-3xl mb-12 sm:text-4xl md:text-5xl lg:text-5xl font-black text-white leading-tight max-w-5xl"
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: 0.10,
                        ease: "easeOut",
                    }}
                >
                    La plataforma de recargas de
                    <br />
                    <span className="text-brand-light">
                        los negocios Mexicanos
                    </span>
                </motion.h1>

            </div>

            {/* Banner inferior */}
            {/* <CtaBanner text="Lleva tu negocio al siguiente nivel" /> */}
        </section>
    );
}


// function CtaBanner({ text }: { text: string }) {
//     return (
//         <div className="relative z-10 bg-brand py-2 text-center">
//             <button
//                 onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
//                 className="text-white text-sm font-medium underline underline-offset-2 hover:text-white/80 transition-colors"
//             >
//                 {text}
//             </button>
//         </div>
//     );
// }

