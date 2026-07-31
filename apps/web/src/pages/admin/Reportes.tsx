import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader } from "lucide-react";
import { api } from "../../lib/api.js";
import { getAdminUser } from "../../lib/auth.js";
import type { CompaniaKey, EstadoSolicitud } from "../../types.js";

interface TabDef {
  estado: EstadoSolicitud;
  label: string;
}

const ALL_ESTADOS: TabDef[] = [
  { estado: "RECIBIDA", label: "Nuevas" },
  { estado: "REVISION_PAGO", label: "En revisión" },
  { estado: "PAGO_RECHAZADO", label: "Rechazadas" },
  { estado: "PAGO_VALIDADO", label: "Validadas" },
  { estado: "EN_ACTIVACION", label: "Activando" },
  { estado: "QR_ENVIADO", label: "QR enviado" },
  { estado: "ACTIVADA", label: "Activadas" },
  { estado: "CANCELADA", label: "Canceladas" },
];

const ESTADOS_POR_ROL: Record<string, EstadoSolicitud[]> = {
  PRO: ["RECIBIDA", "REVISION_PAGO", "PAGO_RECHAZADO", "PAGO_VALIDADO", "EN_ACTIVACION", "QR_ENVIADO", "ACTIVADA", "CANCELADA"],
  GENERAL: ["RECIBIDA", "REVISION_PAGO", "PAGO_RECHAZADO", "PAGO_VALIDADO", "EN_ACTIVACION"],
  RECARGAS: ["QR_ENVIADO", "ACTIVADA"],
};

const COMPANIA_OPTIONS = [
  { value: "ATT", label: "AT&T" },
  { value: "MOVISTAR", label: "Movistar" },
  { value: "BAIT", label: "Bait" },
];

const INPUT_CLASS =
  "w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AdminReportes() {
  const admin = getAdminUser();
  const rol = admin?.rol ?? "GENERAL";
  const estadosPermitidos = ESTADOS_POR_ROL[rol] ?? [];
  const estados = ALL_ESTADOS.filter((e) => estadosPermitidos.includes(e.estado));

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [compania, setCompania] = useState<CompaniaKey | "">("");
  const [estado, setEstado] = useState<EstadoSolicitud | "">("");
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const { data: todas = [] } = useQuery({
    queryKey: ["admin", "solicitudes"],
    queryFn: () => api.admin.solicitudes.list(),
  });

  const coincidencias = todas.filter((s) => {
    if (!estadosPermitidos.includes(s.estado)) return false;
    if (estado && s.estado !== estado) return false;
    if (compania && s.compania !== compania) return false;
    if (desde && s.createdAt.slice(0, 10) < desde) return false;
    if (hasta && s.createdAt.slice(0, 10) > hasta) return false;
    return true;
  }).length;

  async function descargar() {
    setError(undefined);
    setDescargando(true);
    try {
      const blob = await api.admin.reportes.solicitudesXlsx({
        desde: desde ? `${desde}T00:00:00.000Z` : undefined,
        hasta: hasta ? `${hasta}T23:59:59.999Z` : undefined,
        compania: compania || undefined,
        estado: estado || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `megatae-solicitudes-${hoyISO()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el reporte");
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-white font-black text-2xl mb-2">Reportes</h1>
      <p className="text-white/40 text-sm mb-6">
        Descarga la información de solicitudes de eSIM en Excel, con los filtros que necesites.
      </p>

      <div className="bg-navy-800 border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">Compañía</label>
            <select
              value={compania}
              onChange={(e) => setCompania(e.target.value as CompaniaKey | "")}
              className={INPUT_CLASS}
            >
              <option value="">Todas</option>
              {COMPANIA_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoSolicitud | "")}
              className={INPUT_CLASS}
            >
              <option value="">Todos los que puedo ver</option>
              {estados.map((e) => (
                <option key={e.estado} value={e.estado}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">
            {coincidencias} solicitud{coincidencias === 1 ? "" : "es"} con estos filtros
          </p>
          <button
            onClick={descargar}
            disabled={descargando}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {descargando ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
