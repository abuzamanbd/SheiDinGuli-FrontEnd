import { NextResponse, type NextRequest } from 'next/server';
import { refreshSession as refresh } from '@/lib/auth/refresh';
import { ALL_COOKIE_NAMES, authCookies } from '@/lib/auth/cookies';
import { COOKIE } from '@/lib/auth/config';

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
