import { callBackend } from './backend';
import type { AuthResult } from './types';

// Several requests (page + prefetches + API calls) can arrive together with the same expired access cookie.
// Share one refresh call between them, otherwise the second one would use an already-rotated token.
const inflight = new Map<string, Promise<{ status: number; data: AuthResult | null }>>();

export function refreshSession(refreshToken: string) {
  let p = inflight.get(refreshToken);
  if (!p) {
    p = callBackend<AuthResult>('auth/refresh', { refreshToken })
      .then((r) => ({ status: r.status, data: r.ok ? r.data : null }))
      .finally(() => setTimeout(() => inflight.delete(refreshToken), 5000));
    inflight.set(refreshToken, p);
  }
  return p;
}
