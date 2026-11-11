import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { callBackend } from './backend';
import { ALL_COOKIE_NAMES, authCookies, toSessionUser } from './cookies';
import { toFormError } from './errors';
import { COOKIE } from './config';
import type { AuthResult } from './types';

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Shared by /api/auth/login and /api/auth/register: call the API, then keep the tokens in httpOnly cookies. */
export async function authenticate(kind: 'login' | 'register', request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ message: 'অনুরোধটি পড়া যায়নি।' }, { status: 400 }); }

  const payload = kind === 'login'
    ? { identifier: str(body.username), password: str(body.password, 128) }
    : { firstName: str(body.first, 60), lastName: str(body.last, 60), username: str(body.username, 30), password: str(body.password, 128) };

  const result = await callBackend<AuthResult & { detail?: string }>(`auth/${kind}`, payload);
  if (!result.ok || !result.data) {
    const problem = result.data as unknown as { detail?: string; errors?: Record<string, string[]> } | null;
    return NextResponse.json(toFormError(result.status, problem), { status: result.status === 0 ? 503 : result.status });
  }

  const jar = await cookies();
  for (const c of authCookies(result.data)) jar.set(c.name, c.value, c.options);
  return NextResponse.json({ user: toSessionUser(result.data) });
}

export async function signOut() {
  const jar = await cookies();
  let access = jar.get(COOKIE.access)?.value;
  let refresh = jar.get(COOKIE.refresh)?.value;
  // The access token lives only a few minutes. If it already expired, get a fresh pair first so the API can revoke it.
  if (!access && refresh) {
    const renewed = await callBackend<AuthResult>('auth/refresh', { refreshToken: refresh });
    if (renewed.ok && renewed.data) { access = renewed.data.accessToken; refresh = renewed.data.refreshToken; }
  }
  // Best effort: tell the API to revoke the tokens, but always clear this browser.
  if (access && refresh) await callBackend('auth/logout', { refreshToken: refresh }, access);
  for (const name of ALL_COOKIE_NAMES) jar.delete(name);
  return NextResponse.json({ ok: true });
}
