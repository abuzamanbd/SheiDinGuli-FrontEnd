import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL, COOKIE } from '@/lib/auth/config';
import { ALL_COOKIE_NAMES, authCookies, decodeSession, encodeSession, type CookieEntry } from '@/lib/auth/cookies';
import { refreshSession } from '@/lib/auth/refresh';

/**
 * Forwards browser calls to the ASP.NET API with the access token from the httpOnly cookie.
 * Only the areas the signed-in screens use are reachable; auth endpoints have their own routes.
 */
const ALLOWED = [
  /^posts(\/|$)/, /^review(\/|$)/, /^users\/me(\/|$)/,
  /^notifications(\/|$)/, /^public\//, /^social(\/|$)/, /^roles(\/|$)/, /^users\/staff(\/|$)/, /^users\/[0-9a-fA-F-]{36}\/(roles|suspend|activate)$/
];

/** These work without signing in (a signed-in caller just gets more: their own held comments, their like state). */
const OPEN = /^(public\/|social\/state$)/;

async function forward(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const rel = path.join('/');
  if (!ALLOWED.some((r) => r.test(rel))) return NextResponse.json({ title: 'Not found' }, { status: 404 });

  const jar = await cookies();
  let token = jar.get(COOKIE.access)?.value;
  const refreshToken = jar.get(COOKIE.refresh)?.value;
  let renewed: CookieEntry[] | null = null;
  let sessionGone = false;

  /** Gets a new access token with the refresh cookie. Returns false when that is not possible. */
  async function renew(): Promise<boolean> {
    if (!refreshToken) return false;
    const r = await refreshSession(refreshToken);
    if (r.data) {
      renewed = authCookies(r.data);
      token = r.data.accessToken;
      return true;
    }
    if (r.status === 400 || r.status === 401) sessionGone = true;
    return false;
  }

  if (!token) await renew();

  const hasBody = request.method !== 'GET' && request.method !== 'DELETE';
  const body = hasBody ? await request.text() : undefined;
  const call = () => fetch(`${API_BASE_URL}/api/v1/${rel}${request.nextUrl.search}`, {
    method: request.method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(hasBody ? { 'Content-Type': 'application/json' } : {}) },
    body,
    cache: 'no-store'
  });

  let upstream: Response | null = null;
  if (token || OPEN.test(rel)) {
    try {
      upstream = await call();
      // The access token can be rejected even though it has not expired (for example after the API restarted).
      if (upstream.status === 401 && token && !renewed && (await renew()) && token) upstream = await call();
    } catch {
      return NextResponse.json({ title: 'API unreachable' }, { status: 503 });
    }
  }

  const text = upstream ? await upstream.text() : '';
  if (upstream?.status === 401) {
    console.warn(`[bff] ${request.method} ${rel} -> 401 from the API. WWW-Authenticate: ${upstream.headers.get('www-authenticate') ?? '(none)'}`);
  }
  const response = upstream
    ? new NextResponse(text || null, { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' } })
    : NextResponse.json({ title: 'Unauthorized' }, { status: 401 });

  if (renewed) for (const c of renewed as CookieEntry[]) response.cookies.set(c.name, c.value, c.options);
  if (sessionGone && !renewed) for (const name of ALL_COOKIE_NAMES) response.cookies.delete(name);

  // Once the profile form is saved the cookie copy of the user must stop saying "onboarding needed".
  if (upstream?.ok && hasBody && /^users\/me\/(onboarding|profile)$/.test(rel)) {
    const user = decodeSession(jar.get(COOKIE.session)?.value);
    if (user && !user.onboardingCompleted) {
      response.cookies.set(COOKIE.session, encodeSession({ ...user, onboardingCompleted: true }), {
        httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/',
        expires: new Date(Date.now() + 30 * 24 * 3600 * 1000)
      });
    }
  }
  return response;
}

export { forward as GET, forward as POST, forward as PUT, forward as DELETE };
