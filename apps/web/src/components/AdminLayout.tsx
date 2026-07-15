import { Outlet, NavLink, Navigate, useNavigate } from "react-router-dom";
import { ListTodo, Settings, LogOut } from "lucide-react";
import { getAdminUser, clearSession } from "../lib/auth.js";

export function AdminLayout() {
  const navigate = useNavigate();
  const admin = getAdminUser();

  if (!admin) return <Navigate to="/admin/login" replace />;

  function logout() {
    clearSession();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-navy-950">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <img
            src="/assets/logo-megatae.png"
            alt="Megatae Global"
            className="h-8 w-auto object-contain"
          />
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          <NavLink
            to="/admin/solicitudes"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand/20 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <ListTodo className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Solicitudes
          </NavLink>

          {admin.rol === "PRO" && (
            <NavLink
              to="/admin/configuracion"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand/20 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Settings className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              Configuración
            </NavLink>
          )}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-xs font-medium truncate">{admin.nombre}</p>
            <p className="text-white/40 text-xs truncate">{admin.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
