import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api.js";
import type { Plan, CompaniaKey } from "../../types.js";


const COMPANY_CFG: Record<
  CompaniaKey,
  {
    accentColor: string;
    strongColor: string;
    textColor: string;
    headerGradient: string;
    esimIcon: string;
    textDark: boolean;
  }
> = {
  MOVISTAR: {
    accentColor: "#3B82F6",
    strongColor: "#1D5FC4",
    textColor: "#1D5FC4",
    headerGradient: "linear-gradient(135deg, #4A90F0 0%, #1D5FC4 100%)",
    esimIcon: "/assets/esim-azul.png",
    textDark: false,
  },
  ATT: {
    accentColor: "#9f62d9",
    strongColor: "#6B2FA0",
    textColor: "#6B2FA0",
    headerGradient: "linear-gradient(135deg, #B07AE8 0%, #6B2FA0 100%)",
    esimIcon: "/assets/esim-morado.png",
    textDark: false,
  },
  BAIT: {
    accentColor: "#FFE600",
    strongColor: "#D4A800",
    textColor: "#000000",
    headerGradient: "linear-gradient(135deg, #FFE600 0%, #F0C800 100%)",
    esimIcon: "/assets/esim-amarillo.png",
    textDark: true,
  },
};

const COMPANY_LOGO: Record<CompaniaKey, string> = {
  ATT: "/assets/logo-att.png",
  MOVISTAR: "/assets/logo-movistar.png",
  BAIT: "/assets/logo-bait.png",
};

export function PlanesSection() {
  const { data: rawPlanes = [], isLoading } = useQuery({
    queryKey: ["planes"],
    queryFn: api.planes.list,
  });
  const planes = [...rawPlanes].sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));

  return (
    <section id="planes" className="bg-navy-900 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-white font-black text-3xl md:text-4xl mb-2 px-4">
          Elige tu compañía favorita
        </h2>
        <p className="text-center text-white/60 mb-10 px-4">
          Contrata tu eSIM y consigue exclusivas promociones
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop — grid */}
            <div className="hidden md:grid px-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {planes.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>

            {/* Mobile — carousel horizontal */}
            <MobileCarousel planes={planes} />
          </>
        )}
      </div>
    </section>
  );
}

function MobileCarousel({ planes }: { planes: Plan[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / planes.length;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActive(Math.min(Math.max(index, 0), planes.length - 1));
  }

  function scrollTo(i: number) {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / planes.length;
    el.scrollTo({ left: cardWidth * i, behavior: "smooth" });
  }

  return (
    <div className="md:hidden">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div className="flex gap-4" style={{ width: "max-content", padding: "0 14vw" }}>
          {planes.map((plan) => (
            <div key={plan.id} style={{ width: "72vw", maxWidth: 280, scrollSnapAlign: "center" }} className="pt-6">
              <PlanCard plan={plan} />
            </div>
          ))}
        </div>
      </div>

      {/* Bullets */}
      <div className="flex justify-center gap-2 mt-2">
        {planes.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === active
                ? "w-5 h-2 bg-brand"
                : "w-2 h-2 bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const navigate = useNavigate();
  const cfg = COMPANY_CFG[plan.compania];

  function goToComprar() {
    navigate("/comprar", { state: { compania: plan.compania, planId: plan.id, descripcion: plan.descripcion } });
  }

  const features = (plan.descripcion ?? "").split("-").map((d) => d.trim()).filter(Boolean);

  return (
    <div className="relative flex flex-col cursor-pointer group" onClick={goToComprar}>
      {plan.destacado && (
        <div className="absolute -top-5 left-0 right-0 flex justify-center z-10">
          <span
            className="text-[11px] font-black tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg"
            style={{ background: "linear-gradient(90deg, #FF6B35 0%, #F7397B 100%)", color: "#fff" }}
          >
            MÁS VENDIDO
          </span>
        </div>
      )}
    <div
      className="rounded-2xl p-0.5 shadow-xl transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.98]"
      style={{ background: plan.destacado ? "linear-gradient(90deg, #FF6B35 0%, #F7397B 100%)" : "transparent" }}
    >
    <div className="relative flex flex-col rounded-[14px] overflow-hidden bg-white">
      {/* Header band — logo */}
      <div
        className="relative flex items-center justify-center py-3 px-4"
        style={{ background: cfg.headerGradient }}
      >
        <CompanyLogo compania={plan.compania} />
      </div>

      {/* eSIM chip */}
      <div className="flex flex-col items-center pt-3 pb-2 px-4">
        <img
          src={cfg.esimIcon}
          alt="eSIM"
          className="w-20 h-20 object-contain"
        />
      </div>

      {/* Precio */}
      <div className="flex flex-col items-center py-2 px-4 border-b border-gray-100">
        <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: cfg.textColor }}>Por solo</p>
        <p className="text-5xl font-black leading-none" style={{ color: cfg.textColor }}>
          <span className="text-2xl font-bold align-top mt-1 mr-0.5">$</span>{plan.precio}
        </p>
        <p className="text-gray-400 text-[10px] mt-0.5">MXN</p>
        <div
          className="mt-2 text-[11px] font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: `${cfg.strongColor}18`, color: cfg.textColor, border: `1px solid ${cfg.strongColor}44` }}
        >
          Incluye recarga de ${plan.recarga} MXN
        </div>
        {(plan.megas || plan.dias) && (
          <p className="mt-1.5 text-[11px] font-semibold" style={{ color: cfg.textColor }}>
            {[plan.megas ? `${plan.megas} GB` : null, plan.dias ? `${plan.dias} días` : null].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* Features + botón */}
      <div className="flex-1 flex flex-col p-3 gap-3">
        {features.length > 0 && (
          <ul className="flex flex-col gap-1">
            {features.map((d) => (
              <li key={d} className="flex items-center gap-2 text-gray-600 text-xs">
                <FeatureIcon label={d} color={cfg.textColor} />
                {d}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={goToComprar}
          className="w-full mt-auto font-bold py-2 rounded-xl text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: cfg.strongColor, color: cfg.textDark ? "#000" : "#fff" }}
        >
          Me interesa
        </button>
      </div>
    </div>
    </div>
    </div>
  );
}

function FeatureIcon({ label, color }: { label: string; color: string }) {
  if (label.toLowerCase().includes("inmediata") || label.toLowerCase().includes("rápid")) {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={color}>
        <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
      </svg>
    );
  }
  if (label.toLowerCase().includes("sim") || label.toLowerCase().includes("física")) {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2H9L4 7v14a1 1 0 001 1h14a1 1 0 001-1V3a1 1 0 00-1-1z" />
        <rect x="8" y="11" width="8" height="7" rx="1" />
      </svg>
    );
  }
  if (label.toLowerCase().includes("conexión") || label.toLowerCase().includes("segur") || label.toLowerCase().includes("mundo")) {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CompanyLogo({ compania }: { compania: CompaniaKey }) {
  return (
    <img
      src={COMPANY_LOGO[compania]}
      alt={compania}
      className="h-12 w-auto object-contain"
    />
  );
}
