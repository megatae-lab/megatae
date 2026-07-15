import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Mail } from "lucide-react";
import { Stepper } from "../../components/Stepper.js";

const STEPS = ["Tus datos", "Pago", "Confirmación"];

interface GraciasState {
  id: number;
  email: string;
  nombre: string;
}

export function Gracias() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as GraciasState | null;

  useEffect(() => {
    if (!state?.id) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  return (
    <div className="min-h-screen bg-navy-900 py-10 px-4">
      <div className="mx-auto max-w-lg">
        <Stepper steps={STEPS} current={2} />

        <div className="bg-navy-800 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="flex justify-center mb-5">
            <CheckCircle className="w-16 h-16 text-brand" strokeWidth={1.5} />
          </div>

          <h1 className="text-white font-black text-2xl mb-2">
            ¡Solicitud enviada!
          </h1>
          <p className="text-white/60 text-sm mb-6">
            Número de solicitud:{" "}
            <span className="text-white font-mono font-semibold">#{state.id}</span>
          </p>

          <div className="bg-navy-900 border border-white/10 rounded-xl p-4 flex items-start gap-3 text-left mb-6">
            <Mail className="w-5 h-5 text-brand shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-white text-sm font-medium">Revisa tu correo</p>
              <p className="text-white/50 text-xs mt-0.5">
                Enviamos una confirmación a <span className="text-white/80">{state.email}</span>.
                Una vez que validemos tu pago recibirás tu código QR en ese mismo correo.
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-block bg-brand hover:bg-brand-dark text-white font-bold px-8 py-3 rounded-lg transition-colors text-sm"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
