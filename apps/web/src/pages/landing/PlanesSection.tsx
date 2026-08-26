import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api.js";
import type { Plan, CompaniaKey } from "../../types.js";
import {
  FaWhatsapp,
  FaTelegram,
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaYoutube,
  FaCirclePlay,
} from "react-icons/fa6";

const NAVY = "#0B1E42";

const COMPANY_CFG: Record<
  CompaniaKey,
  {
    badgeGradient: string;
    strongColor: string;
    textDark: boolean;
  }
> = {
  MOVISTAR: {
    badgeGradient: "linear-gradient(135deg, #5FD437 0%, #2E9E3F 100%)",
    strongColor: "#3FA800",
    textDark: false,
  },
  ATT: {
    badgeGradient: "linear-gradient(135deg, #B07AE8 0%, #6B2FA0 100%)",
    strongColor: "#6B2FA0",
    textDark: false,
  },
  BAIT: {
    badgeGradient: "linear-gradient(135deg, #FFE600 0%, #F0C800 100%)",
    strongColor: "#F0C800",
    textDark: true,
  },
};

const COMPANY_LOGO: Record<CompaniaKey, string> = {
  ATT: "/assets/logo-att.png",
  MOVISTAR: "/assets/logo-movistar.png",
  BAIT: "/assets/logo-bait.png",
};

// Apps por compañía, como en el diseño de referencia.
// Los íconos vienen de la librería react-icons (paquete "fa6"), así que
// no hace falta subir ningún asset propio.
type AppKey = "whatsapp" | "telegram" | "facebook" | "instagram" | "x" | "tiktok" | "youtube" | "vix";

const COMPANY_APPS: Record<CompaniaKey, AppKey[]> = {
  BAIT: ["whatsapp", "telegram", "facebook", "instagram", "x"],
  MOVISTAR: ["vix", "youtube", "tiktok", "whatsapp"],
  ATT: ["facebook", "instagram", "whatsapp", "x", "tiktok"],
};

const APP_STYLE: Record<AppKey, { bg: string; label: string; Icon: React.ComponentType<{ size?: number; color?: string }> }> = {
  whatsapp: { bg: "#25D366", label: "WhatsApp", Icon: FaWhatsapp },
  telegram: { bg: "#29A9EA", label: "Telegram", Icon: FaTelegram },
  facebook: { bg: "#1877F2", label: "Facebook", Icon: FaFacebookF },
  instagram: { bg: "#D6249F", label: "Instagram", Icon: FaInstagram },
  x: { bg: "#111111", label: "X", Icon: FaXTwitter },
  tiktok: { bg: "#111111", label: "TikTok", Icon: FaTiktok },
  youtube: { bg: "#FF0000", label: "YouTube", Icon: FaYoutube },
  // react-icons no trae logo de Vix; usamos un ícono genérico de "play".
  vix: { bg: "#1B1B4B", label: "Vix", Icon: FaCirclePlay },
};

// Texto fijo debajo de los íconos de apps, igual que en el diseño de
// referencia — no depende de que "descripcion" mencione la palabra
// "redes"/"apps", porque el texto real que manda la API varía.
const APPS_LABEL: Record<CompaniaKey, string> = {
  BAIT: "Redes sociales ilimitadas",
  MOVISTAR: "Apps ilimitadas",
  ATT: "Redes sociales ilimitadas",
};

export function PlanesSection() {
  const { data: rawPlanes = [], isLoading } = useQuery({
    queryKey: ["planes"],
    queryFn: api.planes.list,
  });
  const planes = [...rawPlanes].sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));

  return (
    <section id="planes" className="bg-navy-900 py-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-white font-black text-3xl md:text-4xl mb-0.5 px-4">
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
          // Una sola grilla responsiva: el mismo diseño de tarjeta escala bien
          // en mobile (2 columnas) y desktop (hasta 5 columnas), así que ya no
          // hace falta duplicar el bloque desktop/mobile como antes.
          <div className="grid px-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
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
    navigate("/comprar", { state: { compania: plan.compania, planId: plan.id, descripcion: plan.descripcion } });
  }

  const features = (plan.descripcion ?? "")
    .split(/[-·]/)
    .map((d) => d.trim())
    .filter(Boolean);

  return (
    <div className="relative flex flex-col cursor-pointer group" onClick={goToComprar}>
      {plan.destacado && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
          <span
            className="text-[10px] font-black tracking-[0.15em] px-3 py-1 rounded-full shadow-lg whitespace-nowrap"
            style={{ background: "linear-gradient(90deg, #FF6B35 0%, #F7397B 100%)", color: "#fff" }}
          >
            MÁS VENDIDO
          </span>
        </div>
      )}

      <div className="relative flex flex-col items-center rounded-3xl bg-white shadow-xl pt-6 pb-4 px-3 transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.98]">
        {/* Badge eSIM flotante */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border-2 shadow-md z-10"
          style={{ backgroundColor: NAVY }}
        >
          <span className="text-white text-[18px] font-black tracking-wide">eSIM</span>
        </div>

        {/* Logo en pastilla con color de marca */}
        <div
          className="mt-2 w-full flex items-center justify-center rounded-2xl py-3 px-4 shadow-sm"
          style={{ background: cfg.badgeGradient }}
        >
          <img src={COMPANY_LOGO[plan.compania]} alt={plan.compania} className="h-8 w-auto object-contain" />
        </div>

        {/* Por solo $X recibe */}
        <p className="mt-3 mb-2 text-xs font-semibold text-center" style={{ color: NAVY }}>
          Por solo <span className="font-black">${plan.precio}</span> recibe
        </p>

        {/* Precio grande + badge tiempo aire */}
        <div className="relative flex flex-col items-center -mt-1">
          {/* Fondo negro */}
          <div className="bg-black rounded-2xl px-6 pt-2 pb-4 border-2 min-w-36 shadow-md">
            <p className="text-6xl font-black leading-none text-white text-center">
              <span className="text-3xl font-bold align-top mr-0.5">$</span>
              {plan.recarga}
            </p>
          </div>

          {/* Etiqueta azul */}
          <div
            className="absolute -bottom-3 px-3 py-1 rounded-md"
            style={{ backgroundColor: NAVY }}
          >
            <span className="text-white text-[10px] font-bold tracking-wide whitespace-nowrap">
              DE TIEMPO AIRE
            </span>
          </div>
        </div>


        {/* Cajas de estadísticas */}
        <div className="w-full flex flex-col gap-2 mt-4">
          {plan.megas ? (
            <StatBox>
              <WifiIcon color={NAVY} />
              <p className="text-xs font-bold text-gray-800">
                {plan.megas} GB <span className="font-medium text-gray-500">para navegar</span>
              </p>
            </StatBox>
          ) : null}

          <div className="flex flex-col items-center gap-1.5 border-2 border-gray-100 rounded-xl py-2 px-2">
            <div className="flex items-center justify-center gap-1.5">
              {COMPANY_APPS[plan.compania].map((app) => (
                <AppIcon key={app} app={app} />
              ))}
            </div>
            <p className="text-xs font-bold text-gray-800 text-center leading-tight">
              {APPS_LABEL[plan.compania]}
            </p>
          </div>

          {plan.dias ? (
            <StatBox>
              <ClockIcon color={NAVY} />
              <p className="text-xs font-bold text-gray-800">
                <span className="font-medium text-gray-500"> por
                  <br />
                </span> {plan.dias} días
              </p>
            </StatBox>
          ) : null}

          {features.length > 0 && (
            <ul className="flex flex-col gap-1 mt-0.5">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-500 text-[11px] pl-1">
                  <CheckIcon color={cfg.strongColor} />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Botón Comprar eSIM */}
        <button
          onClick={goToComprar}
          className="w-full mt-4 font-bold py-2.5 rounded-full text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: cfg.strongColor, color: cfg.textDark ? "#000" : "#fff" }}
        >
          Comprar eSIM
        </button>
      </div>
    </div>
  );
}

function StatBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 border-2 border-gray-100 rounded-xl py-2 px-2">
      {children}
    </div>
  );
}

function WifiIcon({ color }: { color: string }) {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5a11 11 0 0114 0" />
      <path d="M8.5 16a6 6 0 017 0" />
      <circle cx="12" cy="19.5" r="1" fill={color} stroke="none" />
    </svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function AppIcon({ app }: { app: AppKey }) {
  const { bg, label, Icon } = APP_STYLE[app];
  return (
    <span
      title={label}
      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
      style={{ backgroundColor: bg }}
    >
      <Icon size={12} color="#fff" />
    </span>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}