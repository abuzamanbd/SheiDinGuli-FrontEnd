import { cookies } from 'next/headers';
import { COOKIE } from './config';
import { decodeSession } from './cookies';
import type { SessionUser } from './types';

/** The signed-in user for this request, or null. Safe to call from any server component. */
export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  if (!jar.get(COOKIE.access) && !jar.get(COOKIE.refresh)) return null;
  return decodeSession(jar.get(COOKIE.session)?.value);
}
