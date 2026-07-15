import { logger } from "../lib/logger.js";

export interface SiredAdapter {
  reportarVenta(
    solicitudId: number,
    dn: string,
    compania: string
  ): Promise<{ ok: boolean }>;
}

class StubSiredAdapter implements SiredAdapter {
  async reportarVenta(
    solicitudId: number,
    dn: string,
    compania: string
  ): Promise<{ ok: boolean }> {
    logger.info(
      { solicitudId, dn, compania },
      "SIRED stub: reportarVenta — swap por implementación real cuando esté disponible la API"
    );
    return { ok: true };
  }
}

// Swap esta instancia por RealSiredAdapter cuando llegue la API
export const siredAdapter: SiredAdapter = new StubSiredAdapter();
