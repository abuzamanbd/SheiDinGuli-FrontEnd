import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL, COOKIE } from '@/lib/auth/config';
import { decodeSession, encodeSession } from '@/lib/auth/cookies';

/**
 * Forwards browser calls to the ASP.NET API with the access token from the httpOnly cookie.
 * Only the areas the signed-in screens use are reachable; auth endpoints have their own routes.
 */
const ALLOWED = [
  /^posts(\/|$)/, /^review(\/|$)/, /^users\/me(\/|$)/,
  /^roles(\/|$)/, /^users\/staff(\/|$)/, /^users\/[0-9a-fA-F-]{36}\/(roles|suspend|activate)$/
];

async function forward(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const rel = path.join('/');
  if (!ALLOWED.some((r) => r.test(rel))) return NextResponse.json({ title: 'Not found' }, { status: 404 });

  const jar = await cookies();
  const token = jar.get(COOKIE.access)?.value;
  if (!token) return NextResponse.json({ title: 'Unauthorized' }, { status: 401 });

  const hasBody = request.method !== 'GET' && request.method !== 'DELETE';
  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/api/v1/${rel}${request.nextUrl.search}`, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}`, ...(hasBody ? { 'Content-Type': 'application/json' } : {}) },
      body: hasBody ? await request.text() : undefined,
      cache: 'no-store'
    });
  } catch {
    return NextResponse.json({ title: 'API unreachable' }, { status: 503 });
  }

  const text = await upstream.text();
  const response = new NextResponse(text || null, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
  });

  // Once the profile form is saved the cookie copy of the user must stop saying "onboarding needed".
  if (upstream.ok && hasBody && /^users\/me\/(onboarding|profile)$/.test(rel)) {
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
