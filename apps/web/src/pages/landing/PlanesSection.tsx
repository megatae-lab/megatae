import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api.js";
import type { Plan, CompaniaKey } from "../../types.js";

const COMPANY_CFG: Record<
  CompaniaKey,
  {
    name: string;
    gradient: string;
    buttonCls: string;
    textDark: boolean;
    badge?: string;
  }
> = {
  MOVISTAR: {
    name: "Movistar",
    gradient: "from-[#019DF4] to-[#005A9E]",
    buttonCls: "bg-[#005A9E] hover:bg-[#004A84]",
    textDark: false,
    badge: "MÁS VENDIDO",
  },
  ATT: {
    name: "AT&T",
    gradient: "from-[#00A8E0] to-[#004080]",
    buttonCls: "bg-[#004080] hover:bg-[#003060]",
    textDark: false,
  },
  BAIT: {
    name: "bait",
    gradient: "from-[#FFE600] to-[#FFB300]",
    buttonCls: "bg-[#E6A000] hover:bg-[#CC8F00]",
    textDark: true,
  },
};

const FEATURES = [
  "Activación inmediata",
  "Sin SIM física",
  "Conexión segura",
];

export function PlanesSection() {
  const { data: planes = [], isLoading } = useQuery({
    queryKey: ["planes"],
    queryFn: api.planes.list,
  });

  return (
    <section id="planes" className="bg-navy-900 py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-white font-black text-3xl md:text-4xl mb-2">
          Elige tu compañía favorita
        </h2>
        <p className="text-center text-white/60 mb-10">
          Contrata tu eSIM y consigue exclusivas promociones
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {planes.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const navigate = useNavigate();
  const cfg = COMPANY_CFG[plan.compania];

  function goToComprar() {
    navigate("/comprar", { state: { compania: plan.compania, planId: plan.id } });
  }

  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden shadow-lg border border-white/10">
      {/* Header con gradiente de compañía */}
      <div className={`bg-linear-to-b ${cfg.gradient} p-5 flex flex-col items-center`}>
        {cfg.badge && (
          <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {cfg.badge}
          </span>
        )}
        <CompanyLogo compania={plan.compania} />
        <p className={`text-xs font-medium mt-2 ${cfg.textDark ? "text-black/60" : "text-white/70"}`}>
          DESDE SOLO
        </p>
        <p className={`text-5xl font-black leading-tight ${cfg.textDark ? "text-black" : "text-white"}`}>
          ${plan.precio}
        </p>
        <p className={`text-sm font-semibold mt-1 ${cfg.textDark ? "text-black/70" : "text-white/90"}`}>
          Incluye recarga de ${plan.recarga}
        </p>
      </div>

      {/* Cuerpo */}
      <div className="bg-navy-800 flex-1 flex flex-col p-4 gap-4">
        <ul className="flex flex-col gap-1.5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-white/80 text-sm">
              <svg className="w-4 h-4 text-brand shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={goToComprar}
          className={`w-full mt-auto text-white font-bold py-2.5 rounded-xl text-sm transition-colors ${cfg.buttonCls} ${cfg.textDark ? "!text-white" : ""}`}
        >
          Me interesa
        </button>
      </div>
    </div>
  );
}

const COMPANY_LOGO: Record<CompaniaKey, string> = {
  ATT: "/assets/logo-att.png",
  MOVISTAR: "/assets/logo-movistar.png",
  BAIT: "/assets/logo-bait.png",
};

function CompanyLogo({ compania }: { compania: CompaniaKey }) {
  return (
    <img
      src={COMPANY_LOGO[compania]}
      alt={compania}
      className={`h-10 w-auto object-contain${compania === "BAIT" ? " mix-blend-multiply" : ""}`}
    />
  );
}
