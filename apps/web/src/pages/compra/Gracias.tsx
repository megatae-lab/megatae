import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Mail, AlertCircle } from "lucide-react";
import { Stepper, type StepperTheme } from "../../components/Stepper.js";
import type { CompaniaKey } from "../../types.js";
import { getBasePath } from "../../lib/routes.js";
import { api } from "../../lib/api.js";

const STEPS = ["Datos y pago", "Confirmación"];

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

interface GraciasState {
  folio: string;
  email: string;
  nombre: string;
  compania?: CompaniaKey;
}

// Reintentos cortos: Stripe redirige al cliente de vuelta a /gracias antes
// de que el webhook necesariamente haya terminado de procesar la solicitud
// (createSolicitud ocurre antes del checkout, pero la transición a
// PAGO_VALIDADO depende del webhook). Ver docs/ARCHITECTURE.md.
const REINTENTOS = 5;
const ESPERA_MS = 1500;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function Gracias() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = location.state as GraciasState | null;
  const token = searchParams.get("token");

  const [tokenState, setTokenState] = useState<
    | { status: "cargando" }
    | { status: "error" }
    | { status: "listo"; data: GraciasState }
  >({ status: "cargando" });

  useEffect(() => {
    if (state?.folio || !token) return;

    let cancelado = false;

    async function cargar() {
      for (let intento = 0; intento < REINTENTOS; intento++) {
        if (cancelado) return;
        try {
          const solicitud = await api.solicitudes.byToken(token!);
          if (!cancelado) {
            setTokenState({
              status: "listo",
              data: {
                folio: solicitud.publicCode,
                email: solicitud.email,
                nombre: solicitud.nombre,
                compania: solicitud.compania,
              },
            });
          }
          return;
        } catch {
          if (intento < REINTENTOS - 1) await esperar(ESPERA_MS);
        }
      }
      if (!cancelado) setTokenState({ status: "error" });
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [state, token]);

  useEffect(() => {
    if (!state?.folio && !token) {
      navigate("/", { replace: true });
    }
  }, [state, token, navigate]);

  if (!state?.folio && !token) return null;

  // Fuente de datos: state (flujo de transferencia, llega por navegación
  // interna) o tokenState (flujo de Stripe, llega por redirect externo).
  const datos: GraciasState | null = state?.folio ? state : tokenState.status === "listo" ? tokenState.data : null;

  const theme: CompaniaTheme | null = datos?.compania ? THEME[datos.compania] : null;
  const basePath = getBasePath(datos?.compania);

  const stepperTheme: StepperTheme | undefined = theme
    ? {
      circle: theme.dot,
      ring: theme.stepRing,
      label: theme.text,
      line: theme.dot,
    }
    : undefined;

  return (
    <div className="min-h-screen bg-navy-900 py-10 px-4">
      <div className="mx-auto max-w-lg">
        <Stepper steps={STEPS} current={1} theme={stepperTheme} />

        <div
          className={`bg-navy-800 border rounded-2xl p-8 shadow-2xl text-center transition-colors border-t-4 ${theme ? `${theme.panelBorder} ${theme.panelTop}` : "border-white/10 border-t-brand"
            }`}
        >
          {!datos && tokenState.status === "cargando" && (
            <>
              <div className="flex justify-center mb-5">
                <div className="w-12 h-12 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
              <h1 className="text-white font-black text-2xl mb-2">Confirmando tu pago…</h1>
              <p className="text-white/60 text-sm">
                Esto toma solo unos segundos.
              </p>
            </>
          )}

          {!datos && tokenState.status === "error" && (
            <>
              <div className="flex justify-center mb-5">
                <AlertCircle className="w-16 h-16 text-yellow-400" strokeWidth={1.5} />
              </div>
              <h1 className="text-white font-black text-2xl mb-2">Estamos confirmando tu pago</h1>
              <p className="text-white/60 text-sm mb-6">
                Tu pago se procesó, pero nos está tomando más tiempo de lo normal confirmarlo aquí.
                Te llegará un correo de confirmación en cuanto esté listo — no necesitas hacer nada más.
              </p>
              <Link
                to="/consultar"
                className={`inline-block text-white font-bold px-8 py-3 rounded-lg transition-colors text-sm ${theme ? theme.button : "bg-brand hover:bg-brand-dark"
                  }`}
              >
                Consultar mi solicitud
              </Link>
            </>
          )}

          {datos && (
            <>
              <div className="flex justify-center mb-5">
                <CheckCircle
                  className={`w-16 h-16 ${theme ? theme.text : "text-brand"}`}
                  strokeWidth={1.5}
                />
              </div>

              <h1 className="text-white font-black text-2xl mb-2">
                ¡Solicitud enviada!
              </h1>
              <p className="text-white/60 text-sm mb-6">
                Número de solicitud:{" "}
                <span className="text-white font-mono font-semibold">{datos.folio}</span>
              </p>

              <div
                className={`bg-navy-900 border rounded-xl p-4 flex items-start gap-3 text-left mb-6 transition-colors ${theme ? theme.panelBorder : "border-white/10"
                  }`}
              >
                <Mail
                  className={`w-5 h-5 shrink-0 mt-0.5 ${theme ? theme.text : "text-brand"}`}
                  strokeWidth={1.5}
                />
                <div>
                  <p className="text-white text-sm font-medium">Revisa tu correo</p>
                  <p className="text-white/50 text-xs mt-0.5">
                    Enviamos una confirmación a <span className="text-white/80">{datos.email}</span>.
                    Una vez que validemos tu pago recibirás tu código QR en ese mismo correo.
                  </p>
                </div>
              </div>

              <Link
                to={basePath || "/"}
                className={`inline-block text-white font-bold px-8 py-3 rounded-lg transition-colors text-sm ${theme ? theme.button : "bg-brand hover:bg-brand-dark"
                  }`}
              >
                Volver al inicio
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
