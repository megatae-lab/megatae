import { Smartphone, Globe, ShieldCheck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Benefit {
  Icon: LucideIcon;
  title: string;
  desc: string;
}

const BENEFITS: Benefit[] = [
  {
    Icon: Smartphone,
    title: "Activación 100% digital",
    desc: "Sin trámites presenciales ni esperas.",
  },
  {
    Icon: Globe,
    title: "Conexión donde la necesites",
    desc: "Cobertura nacional con las mejores redes.",
  },
  {
    Icon: ShieldCheck,
    title: "Mayor seguridad",
    desc: "Tu eSIM no se puede perder ni robar.",
  },
  {
    Icon: Zap,
    title: "Mayor comodidad y rapidez",
    desc: "Activa tu línea en minutos desde casa.",
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-[url('/assets/fondo-banner-2.png')] bg-cover bg-center pt-12 md:pt-16 pb-8 px-4">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
        {/* Texto */}
        <div className="flex-1 w-full">
          <h2 className="text-white font-black text-2xl sm:text-3xl md:text-4xl leading-tight mb-6 md:mb-8 text-center md:text-left">
            ¿Por qué te conviene
            <br />
            tener eSIM?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="group flex items-start gap-3 bg-navy-900 border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-brand/50 hover:bg-navy-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/10 cursor-default"
              >
                <b.Icon
                  className="shrink-0 w-8 h-8 text-white transition-transform duration-200 group-hover:scale-110 self-center"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="text-white font-semibold text-sm">{b.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ilustración real */}
        <div className="hidden md:flex shrink-0 items-center justify-center">
          <img
            src="/assets/benefits-phone.png"
            alt="eSIM en tu teléfono"
            className="w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
