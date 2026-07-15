import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronRight } from "lucide-react";
import { api } from "../../lib/api.js";
import type { EstadoSolicitud, SolicitudResumen } from "../../types.js";

interface TabDef {
  estado: EstadoSolicitud;
  label: string;
}

const TABS: TabDef[] = [
  { estado: "RECIBIDA", label: "Nuevas" },
  { estado: "REVISION_PAGO", label: "En revisión" },
  { estado: "PAGO_RECHAZADO", label: "Rechazadas" },
  { estado: "PAGO_VALIDADO", label: "Validadas" },
  { estado: "EN_ACTIVACION", label: "Activando" },
  { estado: "QR_ENVIADO", label: "QR enviado" },
  { estado: "ACTIVADA", label: "Activadas" },
  { estado: "CANCELADA", label: "Canceladas" },
];

const ESTADO_COLOR: Record<EstadoSolicitud, string> = {
  RECIBIDA: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  REVISION_PAGO: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  PAGO_RECHAZADO: "bg-red-500/20 text-red-300 border-red-500/30",
  PAGO_VALIDADO: "bg-green-500/20 text-green-300 border-green-500/30",
  EN_ACTIVACION: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  QR_ENVIADO: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  ACTIVADA: "bg-brand/20 text-brand border-brand/30",
  CANCELADA: "bg-white/5 text-white/30 border-white/10",
};

const COMPANIA_LABEL: Record<string, string> = {
  ATT: "AT&T",
  MOVISTAR: "Movistar",
  BAIT: "Bait",
};

function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "Hace menos de 1h";
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

function masde24h(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > 24 * 3_600_000;
}

export function AdminSolicitudes() {
  const navigate = useNavigate();
  const [tabActual, setTabActual] = useState<EstadoSolicitud>("RECIBIDA");

  const { data: todas = [], isLoading } = useQuery({
    queryKey: ["admin", "solicitudes"],
    queryFn: () => api.admin.solicitudes.list(),
    refetchInterval: 30_000,
  });

  const conteo = Object.fromEntries(
    TABS.map((t) => [t.estado, todas.filter((s) => s.estado === t.estado).length])
  ) as Record<EstadoSolicitud, number>;

  const visibles = todas.filter((s) => s.estado === tabActual);

  return (
    <div className="p-6">
      <h1 className="text-white font-black text-2xl mb-6">Solicitudes</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.estado}
            onClick={() => setTabActual(tab.estado)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tabActual === tab.estado
                ? "bg-brand/20 text-white"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {tab.label}
            {conteo[tab.estado] > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tabActual === tab.estado
                    ? "bg-brand text-white"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {conteo[tab.estado]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visibles.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl py-16 text-center text-white/20 text-sm">
          No hay solicitudes en este estado
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibles.map((s) => (
            <FilaSolicitud
              key={s.id}
              s={s}
              onClick={() => navigate(`/admin/solicitudes/${s.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilaSolicitud({
  s,
  onClick,
}: {
  s: SolicitudResumen;
  onClick: () => void;
}) {
  const alerta = masde24h(s.updatedAt) &&
    !["ACTIVADA", "CANCELADA"].includes(s.estado);

  return (
    <button
      onClick={onClick}
      className="w-full bg-navy-800 border border-white/10 hover:border-white/25 rounded-xl px-4 py-3 flex items-center gap-4 transition-colors text-left"
    >
      {alerta && (
        <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" strokeWidth={2} />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white font-semibold text-sm truncate">{s.nombre}</span>
          <span className="text-white/30 text-xs shrink-0">#{s.id}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>{COMPANIA_LABEL[s.compania] ?? s.compania}</span>
          <span>·</span>
          <span>${s.plan.precio} MXN</span>
          <span>·</span>
          <span>{timeAgo(s.createdAt)}</span>
        </div>
      </div>

      <span
        className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${ESTADO_COLOR[s.estado]}`}
      >
        {TABS.find((t) => t.estado === s.estado)?.label ?? s.estado}
      </span>

      <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
    </button>
  );
}
