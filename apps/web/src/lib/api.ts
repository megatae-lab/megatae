import type {
  AdminUser,
  CuentaBancaria,
  EstadoSolicitud,
  Plan,
  SolicitudDetalle,
  SolicitudPayload,
  SolicitudResumen,
} from "../types.js";
import { clearSession, getToken } from "./auth.js";

// En desarrollo: Vite proxy redirige /api → localhost:3001
// En producción: VITE_API_URL apunta a la URL de Railway (sin /api al final)
const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body as T;
}

async function adminRequest<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      ...(opts?.headers ?? {}),
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (res.status === 401) {
    clearSession();
    window.location.replace("/admin/login");
    throw new Error("Sesión expirada");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body as T;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export const api = {
  planes: {
    list: (): Promise<Plan[]> => request("/planes"),
  },
  leads: {
    create: (email: string, aceptoTerminos: boolean): Promise<{ ok: boolean }> =>
      request("/leads", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, aceptoTerminos }),
      }),
  },
  cuentas: {
    list: (): Promise<CuentaBancaria[]> => request("/cuentas-bancarias"),
  },
  auth: {
    login: (
      email: string,
      password: string
    ): Promise<{ token: string; admin: AdminUser }> =>
      request("/auth/login", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, password }),
      }),
  },
  admin: {
    planes: {
      list: (): Promise<Plan[]> => adminRequest("/admin/planes"),
      create: (data: {
        compania: string;
        precio: number;
        recarga: number;
        descripcion?: string;
      }): Promise<Plan> =>
        adminRequest("/admin/planes", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify(data),
        }),
      update: (
        id: number,
        data: { precio?: number; recarga?: number; descripcion?: string | null; activo?: boolean; destacado?: boolean }
      ): Promise<Plan> =>
        adminRequest(`/admin/planes/${id}`, {
          method: "PATCH",
          headers: JSON_HEADERS,
          body: JSON.stringify(data),
        }),
    },
    cuentas: {
      list: (): Promise<CuentaBancaria[]> => adminRequest("/admin/cuentas-bancarias"),
      create: (data: {
        banco: string;
        titular: string;
        cuenta?: string;
        clabe?: string;
      }): Promise<CuentaBancaria> =>
        adminRequest("/admin/cuentas-bancarias", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify(data),
        }),
      update: (
        id: number,
        data: {
          banco?: string;
          titular?: string;
          cuenta?: string | null;
          clabe?: string | null;
          activo?: boolean;
        }
      ): Promise<CuentaBancaria> =>
        adminRequest(`/admin/cuentas-bancarias/${id}`, {
          method: "PATCH",
          headers: JSON_HEADERS,
          body: JSON.stringify(data),
        }),
      reorder: (ids: number[]): Promise<{ ok: boolean }> =>
        adminRequest("/admin/cuentas-bancarias/reorder", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ ids }),
        }),
    },
    solicitudes: {
      list: (estado?: EstadoSolicitud): Promise<SolicitudResumen[]> =>
        adminRequest(`/admin/solicitudes${estado ? `?estado=${estado}` : ""}`),
      get: (id: number): Promise<SolicitudDetalle> =>
        adminRequest(`/admin/solicitudes/${id}`),
      transicion: (
        id: number,
        estadoNuevo: EstadoSolicitud,
        observacion?: string
      ): Promise<{ ok: boolean }> =>
        adminRequest(`/admin/solicitudes/${id}/estado`, {
          method: "PATCH",
          headers: JSON_HEADERS,
          body: JSON.stringify({ estadoNuevo, observacion }),
        }),
      qrPresignedUrl: (
        id: number,
        contentType: string
      ): Promise<{ uploadUrl: string; publicUrl: string }> =>
        adminRequest(`/admin/solicitudes/${id}/qr/presigned-url`, {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ contentType }),
        }),
      enviarQr: (
        id: number,
        qrUrl: string,
        dn: string
      ): Promise<{ ok: boolean }> =>
        adminRequest(`/admin/solicitudes/${id}/qr`, {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ qrUrl, dn }),
        }),
      recordatorio: (id: number): Promise<{ ok: boolean }> =>
        adminRequest(`/admin/solicitudes/${id}/recordatorio`, { method: "POST" }),
    },
  },
  solicitudes: {
    presignedUrl: (
      contentType: string
    ): Promise<{ uploadUrl: string; publicUrl: string }> =>
      request("/solicitudes/presigned-url", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ contentType }),
      }),
    create: (payload: SolicitudPayload): Promise<{ ok: boolean; id: number }> =>
      request("/solicitudes", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      }),
  },
};
