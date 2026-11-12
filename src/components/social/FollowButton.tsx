'use client';

import { useEffect, useState } from 'react';
import { bff } from '@/lib/bff';
import { toBn } from '@/lib/bn';
import type { SocialState } from '@/lib/social';
import { useAuthModal } from '../auth/AuthModal';

/** Follow / unfollow an author. Anyone with an account can follow; the author gets a notification. */
export function FollowButton({ username }: { username: string }) {
  const { user, open } = useAuthModal();
  const [state, setState] = useState<SocialState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void bff<SocialState>('GET', `social/state?author=${encodeURIComponent(username)}`).then((r) => { if (alive && r.data) setState(r.data); });
    return () => { alive = false; };
  }, [username, user?.id]);

  if (state?.isSelf) return <span className="c-follow__count">{toBn(state.followers)} জন অনুসারী</span>;

  async function toggle() {
    if (!user) { open('login'); return; }
    if (!state) return;
    setBusy(true); setMessage(null);
    const r = await bff<SocialState>(state.following ? 'DELETE' : 'PUT', `social/authors/${encodeURIComponent(username)}/follow`);
    setBusy(false);
    if (r.data) setState(r.data); else setMessage(r.status === 404 ? 'এই লেখককে অনুসরণ করা যাচ্ছে না।' : r.message);
  }

  return (
    <div className="c-follow">
      <button type="button" className={`c-btn${state?.following ? ' c-btn--outline' : ''}`} disabled={busy} aria-pressed={state?.following ?? false} onClick={toggle}>
        {state?.following ? 'অনুসরণ করছেন ✓' : 'অনুসরণ করুন'}
      </button>
      {state && <span className="c-follow__count">{toBn(state.followers)} জন অনুসারী</span>}
      {message && <span className="c-follow__error" role="alert">{message}</span>}
    </div>
  );
}
