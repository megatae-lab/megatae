import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api.js";
import { Stepper, type StepperTheme } from "../../components/Stepper.js";
import type { CompaniaKey, HeroFormState, Plan } from "../../types.js";

const STEPS = ["Tus datos", "Pago", "Confirmación"];

const COMPANIAS: { key: CompaniaKey; label: string }[] = [
  { key: "ATT", label: "AT&T" },
  { key: "MOVISTAR", label: "Movistar" },
  { key: "BAIT", label: "Bait" },
];

interface CompaniaTheme {
  border: string;
  borderSelected: string;
  bg: string;
  text: string;
  ring: string;
  button: string;
  dot: string;
  panelBorder: string;
  panelTop: string;
  hr: string;
  label: string;
  stepRing: string;
}

const THEME: Record<CompaniaKey, CompaniaTheme> = {
ATT: {
    border: "border-[#9f62d9]",
    borderSelected: "border-[#9f62d9]",
    bg: "bg-[#9f62d9]/20",
    text: "text-[#9f62d9]",
    ring: "focus:border-[#9f62d9]",
    button: "bg-[#9f62d9] hover:bg-[#8753b8]",
    dot: "bg-[#9f62d9]",
    panelBorder: "border-[#9f62d9]/30",
    panelTop: "border-t-[#9f62d9]",
    hr: "border-[#9f62d9]/20",
    label: "text-[#c39ee8]",
    stepRing: "ring-[#9f62d9]/30",
  },
  MOVISTAR: {
    border: "border-green-500",
    borderSelected: "border-green-500",
    bg: "bg-green-500/20",
    text: "text-green-400",
    ring: "focus:border-green-500",
    button: "bg-green-500 hover:bg-green-600",
    dot: "bg-green-500",
    panelBorder: "border-green-500/30",
    panelTop: "border-t-green-500",
    hr: "border-green-500/20",
    label: "text-green-300",
    stepRing: "ring-green-500/30",
  },
  BAIT: {
    border: "border-yellow-400",
    borderSelected: "border-yellow-400",
    bg: "bg-yellow-400/20",
    text: "text-yellow-400",
    ring: "focus:border-yellow-400",
    button: "bg-yellow-400 hover:bg-yellow-500",
    dot: "bg-yellow-400",
    panelBorder: "border-yellow-400/30",
    panelTop: "border-t-yellow-400",
    hr: "border-yellow-400/20",
    label: "text-yellow-300",
    stepRing: "ring-yellow-400/30",
  },
};

const LADAS_MX = [
  { label: "Ciudad de México (CDMX)", lada: "55", estado: "CDMX" },
  { label: "Guadalajara (Jalisco)", lada: "33", estado: "Jalisco" },
  { label: "Monterrey (Nuevo León)", lada: "81", estado: "Nuevo León" },
  { label: "Puebla", lada: "222", estado: "Puebla" },
  { label: "Tijuana (Baja California)", lada: "664", estado: "Baja California" },
  { label: "León (Guanajuato)", lada: "477", estado: "Guanajuato" },
  { label: "Hermosillo (Sonora)", lada: "662", estado: "Sonora" },
  { label: "Mérida (Yucatán)", lada: "999", estado: "Yucatán" },
  { label: "Querétaro", lada: "442", estado: "Querétaro" },
  { label: "San Luis Potosí", lada: "444", estado: "San Luis Potosí" },
  { label: "Saltillo (Coahuila)", lada: "844", estado: "Coahuila" },
  { label: "Cancún (Quintana Roo)", lada: "998", estado: "Quintana Roo" },
  { label: "Veracruz", lada: "229", estado: "Veracruz" },
  { label: "Chihuahua", lada: "614", estado: "Chihuahua" },
  { label: "Aguascalientes", lada: "449", estado: "Aguascalientes" },
  { label: "Mexicali (Baja California)", lada: "686", estado: "Baja California" },
  { label: "Morelia (Michoacán)", lada: "443", estado: "Michoacán" },
  { label: "Culiacán (Sinaloa)", lada: "667", estado: "Sinaloa" },
  { label: "Toluca (Estado de México)", lada: "722", estado: "Estado de México" },
  { label: "Acapulco (Guerrero)", lada: "744", estado: "Guerrero" },
  { label: "Torreón (Coahuila)", lada: "871", estado: "Coahuila" },
  { label: "Tuxtla Gutiérrez (Chiapas)", lada: "961", estado: "Chiapas" },
  { label: "Villahermosa (Tabasco)", lada: "993", estado: "Tabasco" },
  { label: "Oaxaca", lada: "951", estado: "Oaxaca" },
  { label: "Durango", lada: "618", estado: "Durango" },
  { label: "Tepic (Nayarit)", lada: "311", estado: "Nayarit" },
  { label: "Colima", lada: "312", estado: "Colima" },
  { label: "Cuernavaca (Morelos)", lada: "777", estado: "Morelos" },
  { label: "Pachuca (Hidalgo)", lada: "771", estado: "Hidalgo" },
  { label: "Tlaxcala", lada: "246", estado: "Tlaxcala" },
  { label: "Campeche", lada: "981", estado: "Campeche" },
  { label: "La Paz (Baja California Sur)", lada: "612", estado: "Baja California Sur" },
  { label: "Chetumal (Quintana Roo)", lada: "983", estado: "Quintana Roo" },
  { label: "Zacatecas", lada: "492", estado: "Zacatecas" },
];

interface LocationState extends Partial<HeroFormState> {
  planId?: number;
}

export function Comprar() {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = (location.state ?? {}) as LocationState;

  const [nombre, setNombre] = useState(initial.nombre ?? "");
  const [email, setEmail] = useState(initial.email ?? "");
  const [telefono, setTelefono] = useState(initial.telefono ?? "");
  const [compania, setCompania] = useState<CompaniaKey | "">(initial.compania ?? "");
  const [planId, setPlanId] = useState<number | null>(initial.planId ?? null);
  const [ladaKey, setLadaKey] = useState("");
  const [error, setError] = useState("");

  const { data: planes = [] } = useQuery({
    queryKey: ["planes"],
    queryFn: api.planes.list,
  });

  const planesCompania = planes.filter(
    (p) => p.compania === compania && p.activo
  );

  const theme: CompaniaTheme | null = compania ? THEME[compania] : null;
  const stepperTheme: StepperTheme | undefined = theme
    ? {
      circle: theme.dot,
      ring: theme.stepRing,
      label: theme.text,
      line: theme.dot,
    }
    : undefined;
  function handleCompaniaChange(c: CompaniaKey) {
    setCompania(c);
    setPlanId(null);
    setLadaKey("");
  }
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!compania) { setError("Selecciona una compañía."); return; }
    if (!planId) { setError("Selecciona un plan."); return; }
    if (compania === "ATT" && !ladaKey) { setError("Selecciona tu LADA para AT&T."); return; }

    const ladaEntry = LADAS_MX.find((l) => l.lada === ladaKey);
    navigate("/pago", {
      state: {
        nombre,
        email,
        telefono,
        compania,
        planId,
        lada: ladaKey || undefined,
        estadoMx: ladaEntry?.estado,
      },
    });
  }

  return (
    <div className="min-h-screen bg-navy-900 py-10 px-4">
      <div className="mx-auto max-w-lg">
        <Stepper steps={STEPS} current={0} theme={stepperTheme} />

        <div
          className={`bg-navy-800 border rounded-2xl p-6 shadow-2xl transition-colors border-t-4 ${theme
            ? `${theme.panelBorder} ${theme.panelTop}`
            : "border-white/10 border-t-brand"
            }`}
        >
          <h1 className="text-white font-black text-2xl mb-6">Elige tu plan</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Compañía */}
            <div>
              <p
                className={`text-sm mb-2 transition-colors ${theme ? theme.label : "text-white/70"
                  }`}
              >
                Compañía
              </p>
              <div className="flex gap-2">
                {COMPANIAS.map((c) => {
                  const t = THEME[c.key];
                  const isSelected = compania === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => handleCompaniaChange(c.key)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${isSelected
                        ? `${t.borderSelected} ${t.bg} text-white`
                        : "border-white/20 bg-white/5 text-white/60 hover:border-white/40"
                        }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Planes */}
            {compania && theme && (
              <div>
                <p className={`text-sm mb-2 transition-colors ${theme.label}`}>
                  Plan
                </p>
                {planesCompania.length === 0 ? (
                  <p className="text-white/40 text-sm">Cargando planes…</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {planesCompania.map((p) => (
                      <PlanOption
                        key={p.id}
                        plan={p}
                        selected={planId === p.id}
                        onSelect={() => setPlanId(p.id)}
                        theme={theme}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LADA — solo AT&T */}
            {compania === "ATT" && (
              <div>
                <label
                  className={`block text-sm mb-1 transition-colors ${theme ? theme.label : "text-white/70"
                    }`}
                >
                  ¿En qué ciudad/estado deseas tu número? (LADA)
                </label>
                <select
                  value={ladaKey}
                  onChange={(e) => setLadaKey(e.target.value)}
                  className={`w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none ${THEME.ATT.ring} transition-colors`}
                  required
                >
                  <option value="">Selecciona tu ciudad…</option>
                  {LADAS_MX.map((l) => (
                    <option key={l.lada + l.label} value={l.lada}>
                      {l.label} — LADA {l.lada}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <hr className={`transition-colors ${theme ? theme.hr : "border-white/10"}`} />

            {/* Datos del cliente */}
            <div className="flex flex-col gap-4">
              <p className={`text-sm -mb-1 transition-colors ${theme ? theme.label : "text-white/70"}`}>
                Tus datos
              </p>
              <Field label="Nombre completo" type="text" value={nombre} onChange={setNombre} required theme={theme} />
              <Field label="Correo electrónico" type="email" value={email} onChange={setEmail} required theme={theme} />
              <Field label="Número de teléfono" type="tel" value={telefono} onChange={setTelefono} required theme={theme} maxLength={10} />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className={`w-full text-white font-bold py-3 rounded-lg transition-colors ${theme ? theme.button : "bg-brand hover:bg-brand-dark"
                }`}
            >
              Continuar al pago
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PlanOption({
  plan,
  selected,
  onSelect,
  theme,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
  theme: CompaniaTheme;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-left ${selected
        ? `${theme.borderSelected} ${theme.bg}`
        : "border-white/20 bg-white/5 hover:border-white/40"
        }`}
    >
      <div>
        <p className={`font-bold text-lg ${selected ? "text-white" : "text-white/80"}`}>
          ${plan.precio} MXN
        </p>
        <p className="text-white/50 text-xs">Incluye recarga de ${plan.recarga} MXN</p>
      </div>
      <span
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? theme.borderSelected : "border-white/30"
          }`}
      >
        {selected && <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`} />}
      </span>
    </button>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
  theme,
  maxLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  theme: CompaniaTheme | null;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        className={`w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none transition-colors ${theme ? theme.ring : "focus:border-brand"
          }`}
      />
    </div>
  );
}
