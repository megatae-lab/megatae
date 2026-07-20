import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader, ExternalLink, AlertCircle, Upload } from "lucide-react";
import { api } from "../../lib/api.js";
import type { EstadoSolicitud, HistorialItem } from "../../types.js";

const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  RECIBIDA: "Nueva",
  REVISION_PAGO: "En revisión",
  PAGO_RECHAZADO: "Rechazada",
  PAGO_VALIDADO: "Pago validado",
  EN_ACTIVACION: "En activación",
  QR_ENVIADO: "QR enviado",
  ACTIVADA: "Activada",
  CANCELADA: "Cancelada",
};

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
  ATT: "AT&T", MOVISTAR: "Movistar", BAIT: "Bait",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function masde24h(iso: string) {
  return Date.now() - new Date(iso).getTime() > 24 * 60 * 60 * 1000;
}

export function AdminSolicitudDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [imgError, setImgError] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | undefined>();
  const [recordatorioState, setRecordatorioState] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const { data: s, isLoading } = useQuery({
    queryKey: ["admin", "solicitudes", Number(id)],
    queryFn: () => api.admin.solicitudes.get(Number(id)),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: ({
      estadoNuevo,
      obs,
    }: {
      estadoNuevo: EstadoSolicitud;
      obs?: string;
    }) => api.admin.solicitudes.transicion(Number(id), estadoNuevo, obs),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "solicitudes"] });
      setShowModal(false);
      setObservacion("");
    },
  });

  function transicion(estadoNuevo: EstadoSolicitud, obs?: string) {
    mutation.mutate({ estadoNuevo, obs });
  }

  async function submitQr(file: File, dn: string) {
    setQrLoading(true);
    setQrError(undefined);
    if (file.size > 5 * 1024 * 1024) {
      setQrError("La imagen del QR no puede superar 5 MB.");
      setQrLoading(false);
      return;
    }
    try {
      const { uploadUrl, publicUrl } = await api.admin.solicitudes.qrPresignedUrl(
        Number(id),
        file.type
      );
      const upload = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!upload.ok) throw new Error("Error al subir el QR — intenta de nuevo");
      await api.admin.solicitudes.enviarQr(Number(id), publicUrl, dn);
      qc.invalidateQueries({ queryKey: ["admin", "solicitudes"] });
    } catch (err) {
      setQrError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setQrLoading(false);
    }
  }

  async function enviarRecordatorio() {
    setRecordatorioState("loading");
    try {
      await api.admin.solicitudes.recordatorio(Number(id));
      setRecordatorioState("sent");
      setTimeout(() => setRecordatorioState("idle"), 3000);
    } catch {
      setRecordatorioState("error");
      setTimeout(() => setRecordatorioState("idle"), 3000);
    }
  }

  if (isLoading || !s) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <button
        onClick={() => navigate("/admin/solicitudes")}
        className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la cola
      </button>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-white font-black text-2xl">
            {s.nombre}{" "}
            <span className="text-white/30 font-normal text-lg">#{s.id}</span>
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {COMPANIA_LABEL[s.compania] ?? s.compania} · ${s.plan.precio} MXN · {fmtDate(s.createdAt)}
          </p>
        </div>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full border ${ESTADO_COLOR[s.estado]}`}
        >
          {ESTADO_LABEL[s.estado]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Columna izquierda — datos + historial */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Datos cliente */}
          <Card title="Datos del cliente">
            <Row label="Correo" value={s.email} />
            <Row label="Teléfono" value={s.telefono} />
            <Row label="Compañía" value={COMPANIA_LABEL[s.compania] ?? s.compania} />
            {s.lada && <Row label="LADA" value={s.lada} />}
            {s.estadoMx && <Row label="Estado" value={s.estadoMx} />}
            {s.ciudad && <Row label="Ciudad" value={s.ciudad} />}
            {s.dn && <Row label="DN asignado" value={s.dn} />}
            {s.observacion && (
              <Row label="Observación" value={s.observacion} highlight />
            )}
          </Card>

          {/* Historial */}
          <Card title="Historial">
            {s.historial.length === 0 ? (
              <p className="text-white/30 text-sm">Sin movimientos aún</p>
            ) : (
              <div className="flex flex-col gap-3">
                {s.historial.map((h) => (
                  <EntradaHistorial key={h.id} h={h} />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Columna derecha — comprobante + QR + acciones */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Comprobante */}
          <Card title="Comprobante de pago">
            <div className="bg-navy-950/60 rounded-lg overflow-hidden mb-3">
              {!imgError ? (
                <img
                  src={s.comprobante}
                  alt="Comprobante"
                  className="w-full object-contain max-h-64"
                  onError={() => setImgError(true)}
                />
              ) : (
                <a
                  href={s.comprobante}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-10 text-brand text-sm hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver comprobante
                </a>
              )}
            </div>
            <div className="bg-brand/10 border border-brand/20 rounded-lg px-3 py-2 text-center">
              <p className="text-white/50 text-xs">Monto esperado</p>
              <p className="text-white font-black text-2xl">${s.plan.precio} MXN</p>
              <p className="text-white/40 text-xs">Recarga ${s.plan.recarga} MXN</p>
            </div>
          </Card>

          {/* QR enviado — visible cuando ya existe */}
          {s.qrUrl && (
            <Card title="QR enviado al cliente">
              <QrPreview url={s.qrUrl} />
              {s.dn && (
                <p className="text-white/70 text-xs text-center mt-2">
                  DN: <span className="text-white font-mono font-semibold">{s.dn}</span>
                </p>
              )}
            </Card>
          )}

          {/* Acciones */}
          <AccionesEstado
            estado={s.estado}
            compania={s.compania}
            updatedAt={s.updatedAt}
            loading={mutation.isPending}
            error={mutation.error?.message}
            onTransicion={transicion}
            onReject={() => setShowModal(true)}
            qrLoading={qrLoading}
            qrError={qrError}
            onEnviarQr={submitQr}
            recordatorioState={recordatorioState}
            onRecordatorio={enviarRecordatorio}
          />
        </div>
      </div>

      {/* Modal rechazo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-1">Rechazar pago</h3>
            <p className="text-white/50 text-sm mb-4">
              El cliente recibirá un correo con el motivo del rechazo.
            </p>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Motivo del rechazo (ej: monto incorrecto, comprobante ilegible…)"
              rows={3}
              className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-brand transition-colors"
            />
            {mutation.error && (
              <p className="text-red-400 text-sm mt-2">{mutation.error.message}</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setShowModal(false); setObservacion(""); }}
                className="flex-1 border border-white/20 text-white/70 hover:text-white py-2 rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!observacion.trim() || mutation.isPending}
                onClick={() => transicion("PAGO_RECHAZADO", observacion)}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {mutation.isPending && (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                )}
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccionesEstado({
  estado,
  compania,
  updatedAt,
  loading,
  error,
  onTransicion,
  onReject,
  qrLoading,
  qrError,
  onEnviarQr,
  recordatorioState,
  onRecordatorio,
}: {
  estado: EstadoSolicitud;
  compania: string;
  updatedAt: string;
  loading: boolean;
  error?: string;
  onTransicion: (e: EstadoSolicitud) => void;
  onReject: () => void;
  qrLoading: boolean;
  qrError?: string;
  onEnviarQr: (file: File, dn: string) => void;
  recordatorioState: "idle" | "loading" | "sent" | "error";
  onRecordatorio: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [dn, setDn] = useState("");
  const isBait = compania === "BAIT";

  if (estado === "ACTIVADA" || estado === "CANCELADA") return null;

  const anyLoading = loading || qrLoading;

  return (
    <Card title="Acciones">
      {error && (
        <p className="text-red-400 text-sm mb-3 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {estado === "RECIBIDA" && (
        <ActionButton
          label="Iniciar revisión"
          color="bg-brand hover:bg-brand-dark"
          loading={anyLoading}
          onClick={() => onTransicion("REVISION_PAGO")}
        />
      )}

      {estado === "REVISION_PAGO" && (
        <div className="flex flex-col gap-2">
          <ActionButton
            label="Validar pago"
            color="bg-green-600 hover:bg-green-700"
            loading={anyLoading}
            onClick={() => onTransicion("PAGO_VALIDADO")}
          />
          <ActionButton
            label="Rechazar pago"
            color="bg-red-600 hover:bg-red-700"
            loading={anyLoading}
            onClick={onReject}
          />
        </div>
      )}

      {estado === "PAGO_RECHAZADO" && (
        <ActionButton
          label="Cancelar solicitud"
          color="bg-white/10 hover:bg-white/20 text-white/70"
          loading={anyLoading}
          onClick={() => onTransicion("CANCELADA")}
        />
      )}

      {estado === "PAGO_VALIDADO" && (
        <ActionButton
          label="Iniciar activación"
          color="bg-purple-600 hover:bg-purple-700"
          loading={anyLoading}
          onClick={() => onTransicion("EN_ACTIVACION")}
        />
      )}

      {estado === "EN_ACTIVACION" && (
        <div className="flex flex-col gap-3">
          {/* Selector de archivo QR */}
          <div>
            <p className="text-white/40 text-xs mb-1.5">Imagen del QR</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => setQrFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-white/20 hover:border-brand/50 rounded-lg py-3 px-3 text-sm text-white/50 hover:text-white/80 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {qrFile ? qrFile.name : "Seleccionar imagen QR (JPG/PNG)"}
            </button>
          </div>

          {/* Campo DN */}
          <div>
            <p className="text-white/40 text-xs mb-1.5">
              Número de línea (DN)
              {isBait && <span className="ml-1 text-white/30">(opcional para Bait)</span>}
            </p>
            <input
              type="text"
              value={dn}
              onChange={(e) => setDn(e.target.value)}
              placeholder={isBait ? "Se asignará cuando el cliente active" : "Ej: 5512345678"}
              className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          {qrError && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {qrError}
            </p>
          )}

          <ActionButton
            label="Enviar QR al cliente"
            color="bg-teal-600 hover:bg-teal-700"
            loading={qrLoading}
            disabled={!qrFile || (!isBait && !dn.trim())}
            onClick={() => {
              if (qrFile) onEnviarQr(qrFile, dn.trim());
            }}
          />
        </div>
      )}

      {estado === "QR_ENVIADO" && (
        <div className="flex flex-col gap-2">
          {masde24h(updatedAt) && (
            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5 mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-yellow-300 text-xs leading-relaxed">
                Han pasado más de 24 horas desde que se envió el QR. Verifica con el cliente antes de confirmar.
              </p>
            </div>
          )}
          <ActionButton
            label="Confirmar activación"
            color="bg-brand hover:bg-brand-dark"
            loading={anyLoading}
            onClick={() => onTransicion("ACTIVADA")}
          />
          <button
            onClick={onRecordatorio}
            disabled={recordatorioState === "loading" || recordatorioState === "sent"}
            className={`w-full font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 border ${
              recordatorioState === "sent"
                ? "border-green-500/40 bg-green-500/10 text-green-400"
                : recordatorioState === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : "border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            {recordatorioState === "loading" && <Loader className="w-4 h-4 animate-spin" />}
            {recordatorioState === "sent"
              ? "Recordatorio enviado"
              : recordatorioState === "error"
              ? "Error al enviar — intenta de nuevo"
              : "Recordar al cliente registro"}
          </button>
          <ActionButton
            label="Cancelar solicitud"
            color="bg-white/10 hover:bg-white/20 text-white/70"
            loading={anyLoading}
            onClick={() => onTransicion("CANCELADA")}
          />
        </div>
      )}
    </Card>
  );
}

function ActionButton({
  label,
  color,
  loading,
  disabled,
  onClick,
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
      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-xs">{label}</span>
      <span
        className={`text-xs text-right ${
          highlight ? "text-yellow-300 font-medium" : "text-white/80"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function QrPreview({ url }: { url: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-6 text-brand text-sm hover:underline"
      >
        <ExternalLink className="w-4 h-4" />
        Ver QR
      </a>
    );
  }
  return (
    <div className="bg-white rounded-lg p-3 flex justify-center">
      <img
        src={url}
        alt="QR eSIM"
        className="w-40 h-40 object-contain"
        onError={() => setErr(true)}
      />
    </div>
  );
}

function EntradaHistorial({ h }: { h: HistorialItem }) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-xs">
          <span className="font-medium">{ESTADO_LABEL[h.estadoAnterior]}</span>
          {" → "}
          <span className="font-medium">{ESTADO_LABEL[h.estadoNuevo]}</span>
        </p>
        {h.observacion && (
          <p className="text-yellow-300/80 text-xs mt-0.5">"{h.observacion}"</p>
        )}
        <p className="text-white/30 text-xs mt-0.5">
          {h.admin?.nombre ?? "Sistema"} · {fmtDate(h.createdAt)}
        </p>
      </div>
    </div>
  );
}
