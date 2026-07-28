import type { CompaniaKey } from "../types";

export const COMPANIA_BASE_PATH: Record<CompaniaKey, string> = {
  ATT: "/v1/eSIM-Att",
  MOVISTAR: "/v1/eSIM-Movistar",
  BAIT: "/v1/eSIM-Bait",
};

export function getBasePath(compania?: CompaniaKey): string {
  return compania ? COMPANIA_BASE_PATH[compania] : "";
}

export function getBasePathFromPathname(pathname: string): string {
  const match = Object.values(COMPANIA_BASE_PATH).find((base) =>
    pathname.startsWith(base)
  );
  return match ?? "";
}