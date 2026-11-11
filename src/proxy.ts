import { NextResponse, type NextRequest } from 'next/server';
import { callBackend } from '@/lib/auth/backend';
import { ALL_COOKIE_NAMES, authCookies } from '@/lib/auth/cookies';
import { COOKIE } from '@/lib/auth/config';
import type { AuthResult } from '@/lib/auth/types';

// Several requests (page + prefetches) can arrive together with the same expired access cookie.
// Share one refresh call between them, otherwise the second one would use an already-rotated token.
const inflight = new Map<string, Promise<{ status: number; data: AuthResult | null }>>();

function refresh(token: string) {
  let p = inflight.get(token);
  if (!p) {
    p = callBackend<AuthResult>('auth/refresh', { refreshToken: token })
      .then((r) => ({ status: r.status, data: r.ok ? r.data : null }))
      .finally(() => setTimeout(() => inflight.delete(token), 5000));
    inflight.set(token, p);
  }
  return p;
}

/** Keeps the user signed in: when the short-lived access cookie has expired, get a new one with the refresh cookie. */
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(COOKIE.refresh)?.value;
  if (request.cookies.get(COOKIE.access) || !refreshToken) return NextResponse.next();

  const { status, data } = await refresh(refreshToken);

  if (data) {
    const entries = authCookies(data);
    for (const c of entries) request.cookies.set(c.name, c.value); // so this very request renders as signed in
    const response = NextResponse.next({ request });
    for (const c of entries) response.cookies.set(c.name, c.value, c.options);
    return response;
  }

  if (status === 401 || status === 400) {
    for (const name of ALL_COOKIE_NAMES) request.cookies.delete(name);
    const response = NextResponse.next({ request });
    for (const name of ALL_COOKIE_NAMES) response.cookies.delete(name);
    return response;
  }
  return NextResponse.next(); // API unreachable: keep the cookies and try again next time
}

export const config = { matcher: ['/((?!_next/|api/auth/|.*\\..*).*)'] };
