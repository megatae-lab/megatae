import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { api } from "../../lib/api.js";
import { getAdminUser } from "../../lib/auth.js";
import type { EstadoRegistro, RegistroRecargasResumen } from "../../types.js";
import {
  ESTADO_REGISTRO_COLOR,
  ESTADO_REGISTRO_LABEL,
  ESTADOS_REGISTRO_ORDEN,
  masde24h,
  puedeVerRecargas,
  timeAgo,
} from "./registrosRecargasUi.js";

const POR_PAGINA = 8;
const FINALES: EstadoRegistro[] = ["CREDENCIALES_ENVIADAS", "CANCELADO"];

export function AdminRegistrosRecargas() {
  const navigate = useNavigate();
  const admin = getAdminUser();
  const [tabActual, setTabActual] = useState<EstadoRegistro>("RECIBIDO");
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const permitido = puedeVerRecargas(admin?.rol);

  const { data: todos = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "registros-recargas"],
    queryFn: () => api.admin.registrosRecargas.list(),
    refetchInterval: 30_000,
    enabled: permitido,
  });

  if (!permitido) {
    return (
      <div className="p-6">
        <div className="bg-navy-800 border border-white/10 rounded-xl p-10 text-center">
          <p className="text-white/50">Esta sección es solo para los roles PRO y Recargas.</p>
        </div>
      </div>
    );
  }

  const q = busqueda.trim().toLowerCase();
  const filtrados = q
    ? todos.filter((r) =>
        [r.nombreCompleto, r.nombreNegocio, r.publicCode].some((v) => v.toLowerCase().includes(q))
      )
    : todos;

  const conteo = Object.fromEntries(
    ESTADOS_REGISTRO_ORDEN.map((e) => [e, filtrados.filter((r) => r.estado === e).length])
  ) as Record<EstadoRegistro, number>;

  const visibles = filtrados.filter((r) => r.estado === tabActual);
  const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visiblesPagina = visibles.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-white font-black text-2xl">Registros de recargas</h1>
        <div className="relative">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="Buscar nombre, negocio o folio"
            className="bg-navy-800 border border-white/15 rounded-lg pl-9 pr-3 py-2 text-white text-sm w-64 placeholder-white/30 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none">
        {ESTADOS_REGISTRO_ORDEN.map((estado) => (
          <button
            key={estado}
            onClick={() => { setTabActual(estado); setPagina(1); }}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tabActual === estado ? "bg-brand/20 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {ESTADO_REGISTRO_LABEL[estado]}
            {conteo[estado] > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tabActual === estado ? "bg-brand text-white" : "bg-white/10 text-white/50"
                }`}
              >
                {conteo[estado]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <div className="border border-red-500/20 bg-red-500/10 rounded-2xl py-10 text-center text-red-300 text-sm">
          No se pudo cargar la cola. Recarga la página.
        </div>
      ) : visibles.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl py-16 text-center text-white/20 text-sm">
          No hay registros en este estado
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {visiblesPagina.map((r) => (
              <Fila key={r.id} r={r} onClick={() => navigate(`/admin/registros-recargas/${r.id}`)} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="flex items-center gap-1 text-sm text-white/40 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <span className="text-white/30 text-xs">Página {paginaActual} de {totalPaginas}</span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="flex items-center gap-1 text-sm text-white/40 hover:text-white disabled:opacity-30 transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Fila({ r, onClick }: { r: RegistroRecargasResumen; onClick: () => void }) {
  const alerta = masde24h(r.updatedAt) && !FINALES.includes(r.estado);
  return (
    <button
      onClick={onClick}
      className="w-full bg-navy-800 border border-white/10 hover:border-white/25 rounded-xl px-4 py-3 flex items-center gap-4 transition-colors text-left"
    >
      {alerta && <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" strokeWidth={2} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white font-semibold text-sm truncate">{r.nombreNegocio}</span>
          <span className="text-white/30 text-xs font-mono shrink-0">{r.publicCode}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="truncate">{r.nombreCompleto}</span>
          <span>·</span>
          <span className="truncate">{r.giroEtiqueta}</span>
          <span>·</span>
          <span className="shrink-0">{timeAgo(r.createdAt)}</span>
        </div>
      </div>
      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${ESTADO_REGISTRO_COLOR[r.estado]}`}>
        {ESTADO_REGISTRO_LABEL[r.estado]}
      </span>
      <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
    </button>
  );
}
