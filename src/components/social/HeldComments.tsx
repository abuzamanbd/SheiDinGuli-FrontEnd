'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { bff } from '@/lib/bff';
import { timeAgoBn } from '@/lib/bn';
import type { HeldComment } from '@/lib/social';

/** Reviewer queue for comments that matched a "flag" word. */
export function HeldComments() {
  const [items, setItems] = useState<HeldComment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await bff<HeldComment[]>('GET', 'social/comments/held');
    if (r.ok) setItems(r.data ?? []); else { setItems([]); setError(r.message); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function act(id: string, approve: boolean) {
    const r = approve ? await bff('POST', `social/comments/${id}/approve`) : await bff('DELETE', `social/comments/${id}`);
    if (r.ok) await load(); else setError(r.message);
  }

  return (
    <section className="c-held" data-section="admin.comments">
      <h2 className="c-held__title">আটকে থাকা মন্তব্য</h2>
      {error && <p className="c-comments__error" role="alert">{error}</p>}
      {items === null && <p>লোড হচ্ছে…</p>}
      {items?.length === 0 && <p className="c-comments__empty">পর্যালোচনার অপেক্ষায় কোনো মন্তব্য নেই।</p>}
      <ul className="c-held__list">
        {items?.map((c) => (
          <li key={c.id} className="c-held__item">
            <div><strong>{c.authorName}</strong> <small>@{c.authorUsername} · {timeAgoBn(c.createdAtUtc)}</small></div>
            <p>{c.body}</p>
            <small>লেখা: <Link href={`/post/${c.postSlug}`}>{c.postTitle}</Link>{c.note ? ` · ধরা পড়া শব্দ: ${c.note}` : ''}</small>
            <div className="c-held__actions">
              <button type="button" className="c-btn" onClick={() => act(c.id, true)}>অনুমোদন</button>
              <button type="button" className="c-btn c-btn--outline" onClick={() => act(c.id, false)}>মুছে দিন</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
