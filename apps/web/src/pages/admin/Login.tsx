import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { api } from "../../lib/api.js";
import { getAdminUser, setSession } from "../../lib/auth.js";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (getAdminUser()) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await api.auth.login(email, password);
      setSession(token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError((err as Error).message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src="/assets/logo-megatae.png"
            alt="Megatae Global"
            className="h-12 w-auto object-contain mx-auto mb-4"
          />
          <p className="text-white/50 text-sm">Panel de administración</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-navy-800 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
        >
          <div>
            <label className="block text-white/70 text-sm mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
