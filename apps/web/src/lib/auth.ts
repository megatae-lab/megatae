const TOKEN_KEY = "mat"; // megatae admin token

export interface AdminUser {
  id: number;
  email: string;
  nombre: string;
  rol: "PRO" | "GENERAL";
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAdminUser(): AdminUser | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as AdminUser & {
      exp?: number;
    };
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      clearSession();
      return null;
    }
    return { id: payload.id, email: payload.email, nombre: payload.nombre, rol: payload.rol };
  } catch {
    return null;
  }
}
