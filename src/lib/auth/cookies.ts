import { COOKIE } from './config';
import type { AuthResult, SessionUser } from './types';

export interface CookieEntry {
  name: string;
  value: string;
  options: { httpOnly: true; sameSite: 'lax'; secure: boolean; path: string; expires: Date };
}

/**
 * Cookie rules: httpOnly (scripts cannot read them), SameSite=Lax, Secure on https, site-wide path, and a real
 * expiry date so they survive closing the browser. The refresh and session cookies last as long as the API's
 * refresh token (60 days, renewed on every refresh = "stay signed in until you log out"). The access cookie is
 * short on purpose; the proxy and the BFF swap it for a fresh one using the refresh cookie.
 */
const opts = (expires: Date): CookieEntry['options'] => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  expires
});

export const toSessionUser = (r: AuthResult): SessionUser => ({
  id: r.userId,
  username: r.username,
  displayName: r.displayName,
  onboardingCompleted: r.onboardingCompleted,
  roles: r.roles
});

export const encodeSession = (u: SessionUser) => Buffer.from(JSON.stringify(u)).toString('base64url');

export function decodeSession(raw: string | undefined): SessionUser | null {
  if (!raw) return null;
  try {
    const u = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as SessionUser;
    return u && typeof u.username === 'string' ? u : null;
  } catch {
    return null;
  }
}

/** The three cookies that represent a signed-in browser. The same list is used by route handlers and the proxy. */
export function authCookies(r: AuthResult): CookieEntry[] {
  const refreshExpiry = new Date(r.refreshTokenExpiresAtUtc);
  return [
    { name: COOKIE.access, value: r.accessToken, options: opts(new Date(r.accessTokenExpiresAtUtc)) },
    { name: COOKIE.refresh, value: r.refreshToken, options: opts(refreshExpiry) },
    { name: COOKIE.session, value: encodeSession(toSessionUser(r)), options: opts(refreshExpiry) }
  ];
}

export const ALL_COOKIE_NAMES = [COOKIE.access, COOKIE.refresh, COOKIE.session];
