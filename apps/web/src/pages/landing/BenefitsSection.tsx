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
    <section className="bg-navy-800 pt-16 pb-8 px-4">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-start gap-12">
        {/* Texto */}
        <div className="flex-1">
          <h2 className="text-white font-black text-3xl md:text-4xl leading-tight mb-8">
            ¿Por qué te conviene
            <br />
            tener eSIM?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-3 bg-navy-900 border border-white/10 rounded-xl p-4"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
                  <b.Icon className="w-5 h-5 text-brand" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{b.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ilustración real */}
        <div className="shrink-0 flex items-center justify-center">
          <img
            src="/assets/benefits-phone.png"
            alt="eSIM en tu teléfono"
            className="w-96 h-96 object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
