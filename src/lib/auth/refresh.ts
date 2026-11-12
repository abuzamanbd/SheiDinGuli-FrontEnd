import { callBackend } from './backend';
import type { AuthResult } from './types';

type Result = { status: number; data: AuthResult | null };

// A page load fires the proxy, server components and several /api/bff calls at once, all with the same cookies.
// The API rotates refresh tokens (one use each), so they must share ONE refresh call. Next compiles the proxy and the
// route handlers as separate bundles, so the map lives on globalThis to be shared between them.
const g = globalThis as unknown as { __sdgRefresh?: Map<string, Promise<Result>> };
const inflight = (g.__sdgRefresh ??= new Map());

export function refreshSession(refreshToken: string): Promise<Result> {
  let p = inflight.get(refreshToken);
  if (!p) {
    p = callBackend<AuthResult>('auth/refresh', { refreshToken })
      .then((r): Result => ({ status: r.status, data: r.ok ? r.data : null }))
      .finally(() => setTimeout(() => inflight.delete(refreshToken), 30_000));
    inflight.set(refreshToken, p);
  }
  return p;
}
