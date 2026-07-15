import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import { api } from "../../lib/api.js";
import { getAdminUser } from "../../lib/auth.js";
import type { Plan, CuentaBancaria } from "../../types.js";

const COMPANIA_LABEL: Record<string, string> = {
  ATT: "AT&T", MOVISTAR: "Movistar", BAIT: "Bait",
};

const COMPANIA_OPTIONS = [
  { value: "ATT", label: "AT&T" },
  { value: "MOVISTAR", label: "Movistar" },
  { value: "BAIT", label: "Bait" },
];

export function AdminConfiguracion() {
  const admin = getAdminUser();
  const [tab, setTab] = useState<"planes" | "cuentas">("planes");

  if (admin?.rol !== "PRO") {
    return (
      <div className="p-6">
        <div className="bg-navy-800 border border-white/10 rounded-xl p-10 text-center">
          <p className="text-white/50">
            Solo el administrador PRO puede acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-white font-black text-2xl mb-6">Configuración</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-950/60 rounded-xl p-1 mb-6 w-fit">
        {(["planes", "cuentas"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? "bg-navy-800 text-white shadow"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {t === "planes" ? "Planes" : "Cuentas bancarias"}
          </button>
        ))}
      </div>

      {tab === "planes" && <PlanesPanel />}
      {tab === "cuentas" && <CuentasPanel />}
    </div>
  );
}

// ─── Planes ─────────────────────────────────────────────────────────────────

type PlanForm = {
  compania: string;
  precio: string;
  recarga: string;
  descripcion: string;
};

const PLAN_FORM_EMPTY: PlanForm = {
  compania: "ATT",
  precio: "",
  recarga: "",
  descripcion: "",
};

function PlanesPanel() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | { plan?: Plan }>(null);
  const [form, setForm] = useState<PlanForm>(PLAN_FORM_EMPTY);
  const [formError, setFormError] = useState<string | undefined>();

  const { data: planes = [], isLoading } = useQuery({
    queryKey: ["admin", "planes"],
    queryFn: () => api.admin.planes.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (f: PlanForm) => {
      const payload = {
        precio: parseFloat(f.precio),
        recarga: parseFloat(f.recarga),
        descripcion: f.descripcion.trim() || undefined,
      };
      if (modal?.plan) {
        return api.admin.planes.update(modal.plan.id, payload);
      }
      return api.admin.planes.create({ compania: f.compania, ...payload });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "planes"] });
      setModal(null);
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      api.admin.planes.update(id, { activo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "planes"] }),
  });

  function openCreate() {
    setForm(PLAN_FORM_EMPTY);
    setFormError(undefined);
    setModal({});
  }

  function openEdit(plan: Plan) {
    setForm({
      compania: plan.compania,
      precio: plan.precio,
      recarga: plan.recarga,
      descripcion: plan.descripcion ?? "",
    });
    setFormError(undefined);
    setModal({ plan });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    if (!parseFloat(form.precio) || !parseFloat(form.recarga)) {
      setFormError("Precio y recarga deben ser números positivos");
      return;
    }
    saveMutation.mutate(form);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-white/40 text-sm">{planes.length} planes registrados</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-navy-800 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <Th>Compañía</Th>
                <Th>Precio</Th>
                <Th>Recarga</Th>
                <Th>Descripción</Th>
                <Th>Estado</Th>
                <Th>{null}</Th>
              </tr>
            </thead>
            <tbody>
              {planes.map((plan) => {
                const toggling =
                  toggleMutation.isPending &&
                  toggleMutation.variables?.id === plan.id;
                return (
                  <tr key={plan.id} className="border-b border-white/5 last:border-0">
                    <Td>
                      <span className="font-medium text-white">
                        {COMPANIA_LABEL[plan.compania]}
                      </span>
                    </Td>
                    <Td>${plan.precio} MXN</Td>
                    <Td>${plan.recarga} MXN</Td>
                    <Td>{plan.descripcion ?? <span className="text-white/20">—</span>}</Td>
                    <Td>
                      <button
                        onClick={() =>
                          toggleMutation.mutate({ id: plan.id, activo: !plan.activo })
                        }
                        disabled={toggling}
                        className={`relative inline-flex h-5 w-9 rounded-full transition-colors focus:outline-none ${
                          plan.activo ? "bg-brand" : "bg-white/20"
                        } ${toggling ? "opacity-50" : ""}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform ${
                            plan.activo ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </Td>
                    <Td>
                      <button
                        onClick={() => openEdit(plan)}
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar plan */}
      {modal !== null && (
        <Modal
          title={modal.plan ? "Editar plan" : "Nuevo plan"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {!modal.plan && (
              <Field label="Compañía">
                <select
                  value={form.compania}
                  onChange={(e) => setForm({ ...form, compania: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
                >
                  {COMPANIA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio (MXN)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  placeholder="150.00"
                  className={INPUT_CLS}
                  required
                />
              </Field>
              <Field label="Recarga (MXN)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.recarga}
                  onChange={(e) => setForm({ ...form, recarga: e.target.value })}
                  placeholder="100.00"
                  className={INPUT_CLS}
                  required
                />
              </Field>
            </div>
            <Field label="Descripción (opcional)">
              <input
                type="text"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Plan básico mensual"
                className={INPUT_CLS}
              />
            </Field>

            {formError && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <ModalActions
              onCancel={() => setModal(null)}
              loading={saveMutation.isPending}
              label={modal.plan ? "Guardar cambios" : "Crear plan"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}

// ─── Cuentas bancarias ───────────────────────────────────────────────────────

type CuentaForm = {
  banco: string;
  titular: string;
  cuenta: string;
  clabe: string;
};

const CUENTA_FORM_EMPTY: CuentaForm = {
  banco: "",
  titular: "",
  cuenta: "",
  clabe: "",
};

function CuentasPanel() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | { cuenta?: CuentaBancaria }>(null);
  const [form, setForm] = useState<CuentaForm>(CUENTA_FORM_EMPTY);
  const [formError, setFormError] = useState<string | undefined>();

  const { data: cuentas = [], isLoading } = useQuery({
    queryKey: ["admin", "cuentas"],
    queryFn: () => api.admin.cuentas.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (f: CuentaForm) => {
      const payload = {
        banco: f.banco.trim(),
        titular: f.titular.trim(),
        cuenta: f.cuenta.trim() || undefined,
        clabe: f.clabe.trim() || undefined,
      };
      if (modal?.cuenta) {
        return api.admin.cuentas.update(modal.cuenta.id, payload);
      }
      return api.admin.cuentas.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cuentas"] });
      setModal(null);
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      api.admin.cuentas.update(id, { activo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cuentas"] }),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => api.admin.cuentas.reorder(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cuentas"] }),
  });

  function move(idx: number, dir: -1 | 1) {
    const newList = [...cuentas];
    const tmp = newList[idx];
    newList[idx] = newList[idx + dir];
    newList[idx + dir] = tmp;
    reorderMutation.mutate(newList.map((c) => c.id));
  }

  function openCreate() {
    setForm(CUENTA_FORM_EMPTY);
    setFormError(undefined);
    setModal({});
  }

  function openEdit(cuenta: CuentaBancaria) {
    setForm({
      banco: cuenta.banco,
      titular: cuenta.titular,
      cuenta: cuenta.cuenta ?? "",
      clabe: cuenta.clabe ?? "",
    });
    setFormError(undefined);
    setModal({ cuenta });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    if (!form.banco.trim() || !form.titular.trim()) {
      setFormError("Banco y titular son requeridos");
      return;
    }
    saveMutation.mutate(form);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-white/40 text-sm">{cuentas.length} cuentas registradas</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva cuenta
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cuentas.map((c, idx) => {
            const toggling =
              toggleMutation.isPending && toggleMutation.variables?.id === c.id;
            return (
              <div
                key={c.id}
                className={`bg-navy-800 border rounded-xl px-4 py-3 flex items-center gap-4 ${
                  c.activo ? "border-white/10" : "border-white/5 opacity-50"
                }`}
              >
                {/* Orden */}
                <div className="flex flex-col gap-0.5">
                  <button
                    disabled={idx === 0 || reorderMutation.isPending}
                    onClick={() => move(idx, -1)}
                    className="text-white/30 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === cuentas.length - 1 || reorderMutation.isPending}
                    onClick={() => move(idx, 1)}
                    className="text-white/30 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{c.banco}</p>
                  <p className="text-white/50 text-xs">{c.titular}</p>
                  {c.cuenta && (
                    <p className="text-white/40 text-xs font-mono">{c.cuenta}</p>
                  )}
                  {c.clabe && (
                    <p className="text-white/40 text-xs font-mono">{c.clabe}</p>
                  )}
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggleMutation.mutate({ id: c.id, activo: !c.activo })}
                  disabled={toggling}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors focus:outline-none ${
                    c.activo ? "bg-brand" : "bg-white/20"
                  } ${toggling ? "opacity-50" : ""}`}
                >
                  <span
                    className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform ${
                      c.activo ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>

                {/* Editar */}
                <button
                  onClick={() => openEdit(c)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal crear/editar cuenta */}
      {modal !== null && (
        <Modal
          title={modal.cuenta ? "Editar cuenta" : "Nueva cuenta"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Field label="Banco">
              <input
                type="text"
                value={form.banco}
                onChange={(e) => setForm({ ...form, banco: e.target.value })}
                placeholder="BBVA"
                className={INPUT_CLS}
                required
              />
            </Field>
            <Field label="Titular">
              <input
                type="text"
                value={form.titular}
                onChange={(e) => setForm({ ...form, titular: e.target.value })}
                placeholder="MEGATAE SA DE CV"
                className={INPUT_CLS}
                required
              />
            </Field>
            <Field label="Número de cuenta (opcional)">
              <input
                type="text"
                value={form.cuenta}
                onChange={(e) => setForm({ ...form, cuenta: e.target.value })}
                placeholder="1234 5678 9012"
                className={INPUT_CLS}
              />
            </Field>
            <Field label="CLABE interbancaria (opcional)">
              <input
                type="text"
                value={form.clabe}
                onChange={(e) => setForm({ ...form, clabe: e.target.value })}
                placeholder="012345678901234567"
                className={INPUT_CLS}
              />
            </Field>

            {formError && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <ModalActions
              onCancel={() => setModal(null)}
              loading={saveMutation.isPending}
              label={modal.cuenta ? "Guardar cambios" : "Crear cuenta"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}

// ─── Shared components ───────────────────────────────────────────────────────

const INPUT_CLS =
  "w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-white/40 text-xs mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-white/30 text-xs font-semibold uppercase tracking-wider px-4 py-3">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="text-white/70 text-sm px-4 py-3">{children}</td>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-navy-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-bold text-lg mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  loading,
  label,
}: {
  onCancel: () => void;
  loading: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-2 mt-1">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 border border-white/20 text-white/70 hover:text-white py-2 rounded-lg text-sm transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
      >
        {loading && <Loader className="w-3.5 h-3.5 animate-spin" />}
        {label}
      </button>
    </div>
  );
}
