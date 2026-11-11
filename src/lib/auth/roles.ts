import type { SessionUser } from './types';

/** Role names seeded by the API. Anyone with a role outside these two is staff (an admin-side user). */
export const AUTHOR_ROLES = ['Author', 'TrustedAuthor'];

export type AdminRoleId = 'super' | 'content' | 'editor' | 'reviewer' | 'policy' | 'other';

export const isStaff = (u: Pick<SessionUser, 'roles'>) => u.roles.some((r) => !AUTHOR_ROLES.includes(r));

/**
 * The admin dashboard variant for this user. Order matters: a user with several roles gets the
 * most powerful one. AdManager / UserManager (no dashboard design yet) fall back to "other".
 */
export function adminRoleOf(u: Pick<SessionUser, 'roles'>): AdminRoleId {
  const has = (n: string) => u.roles.includes(n);
  if (has('SuperAdmin')) return 'super';
  if (has('Editor')) return 'editor';
  if (has('ContentManager')) return 'content';
  if (has('PolicyManager')) return 'policy';
  if (has('Reviewer')) return 'reviewer';
  return 'other';
}

/** Onboarding is for people who signed up themselves. Staff created by an admin skip it. */
export const needsOnboarding = (u: Pick<SessionUser, 'roles' | 'onboardingCompleted'>) => !u.onboardingCompleted && !isStaff(u);

/** Where to send someone right after they sign in. */
export const landingFor = (u: Pick<SessionUser, 'roles'>) => (isStaff(u) ? '/admin' : '/panel');
