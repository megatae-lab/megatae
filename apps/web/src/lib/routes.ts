import type { CompaniaKey } from "../types";

export const COMPANIA_BASE_PATH: Record<CompaniaKey, string> = {
  ATT: "/v1/eSIM-Att",
  MOVISTAR: "/v1/eSIM-Movistar",
  BAIT: "/v1/eSIM-Bait",
};

// Rutas que comparten el Navbar y funcionan como su propio "inicio"
export const EXTRA_BASE_PATHS = ["/vende-recargas"];

// Todas las bases donde existe la pestaña "Conócenos"
export const ALL_BASE_PATHS = [
  ...Object.values(COMPANIA_BASE_PATH),
  ...EXTRA_BASE_PATHS,
];

export function getBasePath(compania?: CompaniaKey): string {
  return compania ? COMPANIA_BASE_PATH[compania] : "";
}

export function getBasePathFromPathname(pathname: string): string {
  const match = ALL_BASE_PATHS.find(
    (base) => pathname === base || pathname.startsWith(base + "/")
  );
  return match ?? "";
}