import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronDown, Search, X, ArrowLeft } from "lucide-react";
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
    button: "bg-[#6B2FA0] hover:bg-[#5a2788]",
    dot: "bg-[#9f62d9]",
    panelBorder: "border-[#9f62d9]/30",
    panelTop: "border-t-[#9f62d9]",
    hr: "border-[#9f62d9]/20",
    label: "text-[#c39ee8]",
    stepRing: "ring-[#9f62d9]/30",
  },
  MOVISTAR: {
    border: "border-[#3B82F6]",
    borderSelected: "border-[#3B82F6]",
    bg: "bg-[#3B82F6]/20",
    text: "text-[#3B82F6]",
    ring: "focus:border-[#3B82F6]",
    button: "bg-[#1D5FC4] hover:bg-[#1a52a8]",
    dot: "bg-[#3B82F6]",
    panelBorder: "border-[#3B82F6]/30",
    panelTop: "border-t-[#3B82F6]",
    hr: "border-[#3B82F6]/20",
    label: "text-[#7eb0f7]",
    stepRing: "ring-[#3B82F6]/30",
  },
  BAIT: {
    border: "border-[#FFE600]",
    borderSelected: "border-[#FFE600]",
    bg: "bg-[#FFE600]/20",
    text: "text-[#D4A800]",
    ring: "focus:border-[#FFE600]",
    button: "bg-[#D4A800] hover:bg-[#b89100]",
    dot: "bg-[#FFE600]",
    panelBorder: "border-[#FFE600]/30",
    panelTop: "border-t-[#FFE600]",
    hr: "border-[#FFE600]/20",
    label: "text-[#F0C800]",
    stepRing: "ring-[#FFE600]/30",
  },
};

const LADAS_MX = [
  { key: "Aguascalientes-4", label: "Aguascalientes — LADA 4", lada: "4", estado: "Aguascalientes" },
  { key: "CDMX-5", label: "CDMX — LADA 5", lada: "5", estado: "CDMX" },
  { key: "EdoMex-5", label: "Estado de México — LADA 5", lada: "5", estado: "Estado de México" },
  { key: "EdoMex-7", label: "Estado de México — LADA 7", lada: "7", estado: "Estado de México" },
  { key: "Guanajuato-4", label: "Guanajuato — LADA 4", lada: "4", estado: "Guanajuato" },
  { key: "Guerrero-7", label: "Guerrero — LADA 7", lada: "7", estado: "Guerrero" },
  { key: "Hidalgo-7", label: "Hidalgo — LADA 7", lada: "7", estado: "Hidalgo" },
  { key: "Jalisco-4", label: "Jalisco — LADA 4", lada: "4", estado: "Jalisco" },
  { key: "Michoacan-4", label: "Michoacán — LADA 4", lada: "4", estado: "Michoacán" },
  { key: "Michoacan-7", label: "Michoacán — LADA 7", lada: "7", estado: "Michoacán" },
  { key: "Morelos-7", label: "Morelos — LADA 7", lada: "7", estado: "Morelos" },
  { key: "Oaxaca-2", label: "Oaxaca — LADA 2", lada: "2", estado: "Oaxaca" },
  { key: "Oaxaca-7", label: "Oaxaca — LADA 7", lada: "7", estado: "Oaxaca" },
  { key: "Puebla-2", label: "Puebla — LADA 2", lada: "2", estado: "Puebla" },
  { key: "Puebla-7", label: "Puebla — LADA 7", lada: "7", estado: "Puebla" },
  { key: "Queretaro-4", label: "Querétaro — LADA 4", lada: "4", estado: "Querétaro" },
  { key: "SLP-4", label: "San Luis Potosí — LADA 4", lada: "4", estado: "San Luis Potosí" },
  { key: "Tlaxcala-2", label: "Tlaxcala — LADA 2", lada: "2", estado: "Tlaxcala" },
  { key: "Veracruz-2", label: "Veracruz — LADA 2", lada: "2", estado: "Veracruz" },
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors((prev) => ({ ...prev, compania: "", plan: "", lada: "" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (!compania) next.compania = "Elige una compañía para continuar.";
    if (compania && !planId) next.plan = "Elige uno de los planes disponibles.";
    if (compania === "ATT" && !ladaKey) next.lada = "Selecciona el estado donde quieres tu número.";
    if (!nombre.trim()) next.nombre = "Escribe tu nombre completo.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Escribe un correo válido (ej. nombre@correo.com).";
    if (!telefono.trim() || telefono.length < 10) next.telefono = "Escribe tu número a 10 dígitos.";

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});
    const ladaEntry = LADAS_MX.find((l) => l.key === ladaKey);
    const selectedPlan = planes.find((p) => p.id === planId);
    navigate("/pago", {
      state: {
        nombre,
        email,
        telefono,
        compania,
        planId,
        lada: ladaEntry?.lada,
        estadoMx: ladaEntry?.estado,
        planPrecio: selectedPlan?.precio,
        planRecarga: selectedPlan?.recarga,
        planMegas: selectedPlan?.megas,
        planDias: selectedPlan?.dias,
        planDescripcion: selectedPlan?.descripcion ?? null,
      },
    });
  }

  return (
    <div className="min-h-screen bg-navy-900 py-10 px-4">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        <Stepper steps={STEPS} current={0} theme={stepperTheme} />

        <div
          className={`bg-navy-800 border rounded-2xl p-6 shadow-2xl transition-colors border-t-4 ${theme
            ? `${theme.panelBorder} ${theme.panelTop}`
            : "border-white/10 border-t-brand"
            }`}
        >
          <h1 className="text-white font-black text-2xl mb-6">Elige tu plan</h1>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            {/* Compañía */}
            <div>
              <p className={`text-sm mb-2 transition-colors ${theme ? theme.label : "text-white/70"}`}>
                Compañía
              </p>
              <div className={`flex gap-2 rounded-xl transition-all ${errors.compania ? "ring-2 ring-red-500/50 ring-offset-2 ring-offset-navy-800" : ""}`}>
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
              <FieldError msg={errors.compania} />
            </div>

            {/* Planes */}
            {compania && theme && (
              <div>
                <p className={`text-sm mb-2 transition-colors ${theme.label}`}>Plan</p>
                {planesCompania.length === 0 ? (
                  <p className="text-white/40 text-sm">Cargando planes…</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {planesCompania.map((p) => (
                      <PlanOption
                        key={p.id}
                        plan={p}
                        selected={planId === p.id}
                        hasError={!!errors.plan}
                        onSelect={() => {
                          setPlanId(p.id);
                          setErrors((prev) => ({ ...prev, plan: "" }));
                        }}
                        theme={theme}
                      />
                    ))}
                  </div>
                )}
                <FieldError msg={errors.plan} />
              </div>
            )}

            {/* LADA — solo AT&T */}
            {compania === "ATT" && (
              <div>
                <label className={`block text-sm mb-1 transition-colors ${theme ? theme.label : "text-white/70"}`}>
                  ¿En qué estado deseas tu número?
                </label>
                <LadaCombobox
                  value={ladaKey}
                  onChange={(v) => {
                    setLadaKey(v);
                    setErrors((prev) => ({ ...prev, lada: "" }));
                  }}
                  hasError={!!errors.lada}
                  theme={theme}
                />
                <FieldError msg={errors.lada} />
              </div>
            )}

            <hr className={`transition-colors ${theme ? theme.hr : "border-white/10"}`} />

            {/* Datos del cliente */}
            <div className="flex flex-col gap-4">
              <p className={`text-sm -mb-1 transition-colors ${theme ? theme.label : "text-white/70"}`}>
                Tus datos
              </p>
              <Field
                label="Nombre completo" type="text" value={nombre}
                onChange={(v) => { setNombre(v); setErrors((p) => ({ ...p, nombre: "" })); }}
                theme={theme} error={errors.nombre}
              />
              <Field
                label="Correo electrónico" type="email" value={email}
                onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: "" })); }}
                theme={theme} error={errors.email}
              />
              <Field
                label="Número de teléfono" type="tel" value={telefono}
                onChange={(v) => {
                  const digits = v.replace(/\D/g, "").slice(0, 10);
                  setTelefono(digits);
                  setErrors((p) => ({ ...p, telefono: "" }));
                }}
                theme={theme} maxLength={10} error={errors.telefono}
              />
            </div>

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
  hasError,
  onSelect,
  theme,
}: {
  plan: Plan;
  selected: boolean;
  hasError: boolean;
  onSelect: () => void;
  theme: CompaniaTheme;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-left ${
        selected
          ? `${theme.borderSelected} ${theme.bg}`
          : hasError
          ? "border-red-500 bg-white/5 hover:border-red-400"
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

function LadaCombobox({
  value,
  onChange,
  hasError,
  theme,
}: {
  value: string;
  onChange: (key: string) => void;
  hasError: boolean;
  theme: CompaniaTheme | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = LADAS_MX.find((l) => l.key === value);
  const filtered = query.trim()
    ? LADAS_MX.filter((l) => l.label.toLowerCase().includes(query.toLowerCase()))
    : LADAS_MX;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleOpen() {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleSelect(key: string) {
    onChange(key);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors text-left ${
          hasError
            ? "border-red-500 bg-navy-900"
            : `bg-navy-900 ${theme ? `border-white/20 ${theme.ring}` : "border-white/20 focus:border-brand"}`
        }`}
      >
        <span className={selected ? "text-white" : "text-white/30"}>
          {selected ? selected.label : "Selecciona tu estado…"}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-navy-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar estado…"
              className="flex-1 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-white/30 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options */}
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-white/30 text-sm">Sin resultados</li>
            ) : (
              filtered.map((l) => (
                <li key={l.key}>
                  <button
                    type="button"
                    onClick={() => handleSelect(l.key)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                      l.key === value ? `font-semibold ${theme ? theme.text : "text-brand"}` : "text-white/80"
                    }`}
                  >
                    {l.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </p>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  theme,
  maxLength,
  error,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  theme: CompaniaTheme | null;
  maxLength?: number;
  error?: string;
}) {
  return (
    <div>
      <label className={`block text-sm mb-1 transition-colors ${error ? "text-red-400" : "text-white/70"}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className={`w-full bg-navy-900 border rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none transition-colors ${
          error
            ? "border-red-500 focus:border-red-400"
            : `border-white/20 ${theme ? theme.ring : "focus:border-brand"}`
        }`}
      />
      <FieldError msg={error} />
    </div>
  );
}
