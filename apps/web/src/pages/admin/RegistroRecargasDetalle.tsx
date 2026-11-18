import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, ExternalLink, Eye, EyeOff, KeyRound, Loader, Wand2 } from "lucide-react";
import { api } from "../../lib/api.js";
import { getAdminUser } from "../../lib/auth.js";
import type { EstadoRegistro, HistorialRegistroItem, RegistroRecargasDetalle } from "../../types.js";
import {
  ESTADO_REGISTRO_COLOR,
  fmtDate,
  masde24h,
  puedeVerRecargas,
} from "./registrosRecargasUi.js";

// Detalle de un registro de negocio para recargas. La contraseña que captura
// el admin solo vive en el estado de este componente: se manda a la API una
// vez, la API la incluye en el correo y la descarta. Nunca se vuelve a
// mostrar (no hay de dónde leerla).

const ESTADO_SINGULAR: Record<EstadoRegistro, string> = {
  RECIBIDO: "Nuevo",
  REVISION_PAGO: "En revisión",
  PAGO_RECHAZADO: "Pago rechazado",
  PAGO_VALIDADO: "Pago validado",
  CREDENCIALES_ENVIADAS: "Credenciales enviadas",
  CANCELADO: "Cancelado",
};

function money(n: number | string) {
  return `$${Number(n).toLocaleString("es-MX", { maximumFractionDigits: 2 })} MXN`;
}

export function AdminRegistroRecargasDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const admin = getAdminUser();
  const permitido = puedeVerRecargas(admin?.rol);

  const { data: r, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "registros-recargas", Number(id)],
    queryFn: () => api.admin.registrosRecargas.get(Number(id)),
    enabled: !!id && permitido,
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

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-300 text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  if (isLoading || !r) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/admin/registros-recargas")}
        className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la cola
      </button>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-white font-black text-2xl">
            {r.nombreNegocio}{" "}
            <span className="text-white/30 font-normal text-lg font-mono">{r.publicCode}</span>
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {r.giroEtiqueta} · Transferencia · {fmtDate(r.createdAt)}
          </p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full border ${ESTADO_REGISTRO_COLOR[r.estado]}`}>
          {ESTADO_SINGULAR[r.estado]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card title="Datos del negocio">
            <Row label="Contacto" value={r.nombreCompleto} />
            <Row label="Correo" value={r.email} />
            <Row label="Teléfono" value={r.telefono} />
            <Row label="Negocio" value={r.nombreNegocio} />
            <Row label="Giro" value={r.giroEtiqueta} />
            {r.montoValidado && <Row label="Monto validado" value={money(r.montoValidado)} />}
            {r.usuarioPlataforma && <Row label="Usuario entregado" value={r.usuarioPlataforma} />}
            {r.credencialesEnviadasAt && <Row label="Credenciales enviadas" value={fmtDate(r.credencialesEnviadasAt)} />}
            {r.observacion && <Row label="Observación" value={r.observacion} highlight />}
          </Card>

          <Card title="Historial">
            {r.historial.length === 0 ? (
              <p className="text-white/30 text-sm">Sin movimientos aún</p>
            ) : (
              <div className="flex flex-col gap-3">
                {r.historial.map((h) => (
                  <EntradaHistorial key={h.id} h={h} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Comprobante r={r} />
          <Acciones r={r} />
        </div>
      </div>
    </div>
  );
}

function Comprobante({ r }: { r: RegistroRecargasDetalle }) {
  const [imgError, setImgError] = useState(false);
  return (
    <Card title="Comprobante de pago">
      <div className="bg-navy-950/60 rounded-lg overflow-hidden mb-3">
        {!imgError ? (
          <a href={r.comprobante} target="_blank" rel="noopener noreferrer" title="Abrir en pestaña nueva">
            <img
              src={r.comprobante}
              alt="Comprobante"
              className="w-full object-contain max-h-72 hover:opacity-90 transition-opacity"
              onError={() => setImgError(true)}
            />
          </a>
        ) : (
          <a
            href={r.comprobante}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-10 text-brand-light text-sm hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Ver comprobante
          </a>
        )}
      </div>
      <div className="bg-brand/10 border border-brand/20 rounded-lg px-3 py-2 text-center">
        <p className="text-white/50 text-xs">Depósito mínimo</p>
        <p className="text-white font-black text-2xl">{money(r.montoMinimo)}</p>
        <p className="text-white/40 text-xs">El comprobante debe ser igual o mayor</p>
      </div>
    </Card>
  );
}

function Acciones({ r }: { r: RegistroRecargasDetalle }) {
  const qc = useQueryClient();
  const [monto, setMonto] = useState("");
  const [rechazando, setRechazando] = useState(false);
  const [observacion, setObservacion] = useState("");

  const transicion = useMutation({
    mutationFn: (data: { estadoNuevo: EstadoRegistro; observacion?: string; montoValidado?: number }) =>
      api.admin.registrosRecargas.transicion(r.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "registros-recargas"] });
      setRechazando(false);
      setObservacion("");
      setMonto("");
    },
  });

  if (r.estado === "CANCELADO") return null;

  if (r.estado === "CREDENCIALES_ENVIADAS") {
    return (
      <Card title="Acciones">
        <p className="text-white/60 text-sm bg-white/5 rounded-lg px-3 py-2.5">
          Registro completado. El negocio recibió su usuario <strong className="text-white">{r.usuarioPlataforma}</strong>{" "}
          por correo. Si pierde la contraseña, restablécela en la plataforma de recargas.
        </p>
      </Card>
    );
  }

  const montoNum = Number(monto);
  const montoValido = monto.trim() !== "" && Number.isFinite(montoNum) && montoNum > 0;
  const bajoMinimo = montoValido && montoNum < r.montoMinimo;
  const pending = transicion.isPending;

  return (
    <Card title="Acciones">
      {transicion.error && (
        <p className="text-red-400 text-sm mb-3 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {transicion.error.message}
        </p>
      )}

      {masde24h(r.updatedAt) && (
        <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5 mb-3">
          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-yellow-300 text-xs leading-relaxed">Lleva más de 24 horas sin moverse.</p>
        </div>
      )}

      {r.estado === "RECIBIDO" && (
        <ActionButton label="Iniciar revisión" color="bg-brand hover:bg-brand-dark" loading={pending}
          onClick={() => transicion.mutate({ estadoNuevo: "REVISION_PAGO" })} />
      )}

      {r.estado === "REVISION_PAGO" && !rechazando && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-white/40 text-xs mb-1.5">Monto que muestra el comprobante (MXN)</p>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder={`Mínimo ${r.montoMinimo}`}
              className={`w-full bg-navy-900 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-colors ${
                bajoMinimo ? "border-red-500" : "border-white/20 focus:border-brand"
              }`}
            />
            {bajoMinimo && (
              <p className="text-red-400 text-xs mt-1">Es menor al mínimo de {money(r.montoMinimo)}. Rechaza el pago.</p>
            )}
          </div>
          <ActionButton label="Validar pago" color="bg-green-600 hover:bg-green-700" loading={pending}
            disabled={!montoValido || bajoMinimo}
            onClick={() => transicion.mutate({ estadoNuevo: "PAGO_VALIDADO", montoValidado: montoNum })} />
          <ActionButton label="Rechazar pago" color="bg-red-600 hover:bg-red-700" loading={false}
            disabled={pending}
            onClick={() => {
              setRechazando(true);
              if (bajoMinimo) setObservacion(`El comprobante es por ${money(montoNum)} y el depósito mínimo es de ${money(r.montoMinimo)}.`);
            }} />
        </div>
      )}

      {r.estado === "REVISION_PAGO" && rechazando && (
        <div className="flex flex-col gap-3">
          <p className="text-white/50 text-xs">El negocio recibirá un correo con este motivo.</p>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Motivo del rechazo (ej: monto menor al mínimo, comprobante ilegible…)"
            className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-brand"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setRechazando(false); setObservacion(""); }}
              className="flex-1 border border-white/20 text-white/70 hover:text-white py-2 rounded-lg text-sm transition-colors"
            >
              Volver
            </button>
            <button
              disabled={!observacion.trim() || pending}
              onClick={() => transicion.mutate({ estadoNuevo: "PAGO_RECHAZADO", observacion: observacion.trim() })}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              {pending && <Loader className="w-3.5 h-3.5 animate-spin" />}
              Confirmar rechazo
            </button>
          </div>
        </div>
      )}

      {r.estado === "PAGO_RECHAZADO" && (
        <ActionButton label="Cancelar registro" color="bg-white/10 hover:bg-white/20 text-white/70" loading={pending}
          onClick={() => transicion.mutate({ estadoNuevo: "CANCELADO" })} />
      )}

      {r.estado === "PAGO_VALIDADO" && <EnviarCredenciales r={r} />}
    </Card>
  );
}

function generarContrasena(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const valores = new Uint32Array(10);
  crypto.getRandomValues(valores);
  return Array.from(valores, (v) => alfabeto[v % alfabeto.length]).join("");
}

function EnviarCredenciales({ r }: { r: RegistroRecargasDetalle }) {
  const qc = useQueryClient();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const enviar = useMutation({
    mutationFn: () => api.admin.registrosRecargas.enviarCredenciales(r.id, { usuario: usuario.trim(), contrasena }),
    onSuccess: () => {
      setContrasena("");
      qc.invalidateQueries({ queryKey: ["admin", "registros-recargas"] });
    },
    onSettled: () => setConfirmando(false),
  });

  const valido = usuario.trim().length >= 3 && contrasena.length >= 4;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-white/50 text-xs bg-white/5 rounded-lg px-3 py-2.5">
        Da de alta a <strong className="text-white/80">{r.nombreNegocio}</strong> en la plataforma de recargas y captura
        aquí el usuario y la contraseña genérica. Se envían a <strong className="text-white/80">{r.email}</strong>; la
        contraseña no se guarda en el sistema.
      </p>

      <div>
        <p className="text-white/40 text-xs mb-1.5">Usuario</p>
        <input
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          autoComplete="off"
          maxLength={80}
          className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-brand"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-white/40 text-xs">Contraseña genérica</p>
          <button
            type="button"
            onClick={() => { setContrasena(generarContrasena()); setMostrar(true); }}
            className="flex items-center gap-1 text-brand-light text-xs hover:underline"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Generar
          </button>
        </div>
        <div className="relative">
          <input
            type={mostrar ? "text" : "password"}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            autoComplete="new-password"
            maxLength={80}
            className="w-full bg-navy-900 border border-white/20 rounded-lg pl-3 pr-10 py-2 text-white text-sm font-mono focus:outline-none focus:border-brand"
          />
          <button
            type="button"
            onClick={() => setMostrar((m) => !m)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
            aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-white/30 text-xs mt-1">Usa la misma que diste de alta en la plataforma.</p>
      </div>

      {enviar.error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {enviar.error.message}
        </p>
      )}

      {!confirmando ? (
        <ActionButton label="Enviar credenciales" color="bg-teal-600 hover:bg-teal-700" loading={false}
          disabled={!valido} onClick={() => setConfirmando(true)} />
      ) : (
        <div className="flex flex-col gap-2 bg-teal-500/10 border border-teal-500/20 rounded-lg p-3">
          <p className="text-teal-200 text-xs">
            Se enviará el usuario <strong className="font-mono">{usuario.trim()}</strong> a {r.email}. ¿Confirmas?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmando(false)}
              disabled={enviar.isPending}
              className="flex-1 border border-white/20 text-white/70 hover:text-white py-2 rounded-lg text-sm transition-colors"
            >
              Volver
            </button>
            <button
              onClick={() => enviar.mutate()}
              disabled={enviar.isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              {enviar.isPending ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              Sí, enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  label, color, loading, disabled, onClick,
}: {
  label: string;
  color: string;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full font-bold py-2.5 rounded-lg text-sm text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${color}`}
    >
      {loading && <Loader className="w-4 h-4 animate-spin" />}
      {label}
    </button>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl p-4">
      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-xs">{label}</span>
      <span className={`text-xs text-right ${highlight ? "text-yellow-300 font-medium" : "text-white/80"}`}>{value}</span>
    </div>
  );
}

function EntradaHistorial({ h }: { h: HistorialRegistroItem }) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-xs">
          <span className="font-medium">{ESTADO_SINGULAR[h.estadoAnterior]}</span>
          {" → "}
          <span className="font-medium">{ESTADO_SINGULAR[h.estadoNuevo]}</span>
        </p>
        {h.observacion && <p className="text-yellow-300/80 text-xs mt-0.5">"{h.observacion}"</p>}
        <p className="text-white/30 text-xs mt-0.5">
          {h.admin?.nombre ?? "Sistema"} · {fmtDate(h.createdAt)}
        </p>
      </div>
    </div>
  );
}
