'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { bff } from '@/lib/bff';
import { timeAgoBn, toBn } from '@/lib/bn';
import { isRealId, type CommentItem } from '@/lib/social';
import { Avatar } from '../cards/Parts';
import { useAuthModal } from '../auth/AuthModal';

const MAX = 2000;

/** Comments under a post: write, reply (one level), remove your own. Risky wording is held for a moderator. */
export function Comments({ postId, enabled = true }: { postId: string; enabled?: boolean }) {
  const { user, open } = useAuthModal();
  const real = isRealId(postId);
  const [items, setItems] = useState<CommentItem[] | null>(null);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!real) { setItems([]); return; }
    const r = await bff<CommentItem[]>('GET', `public/posts/${postId}/comments`);
    setItems(r.data ?? []);
  }, [postId, real]);

  useEffect(() => { void load(); }, [load, user?.id]);

  // Opened from a notification: /post/slug#c-<id>
  useEffect(() => {
    if (!items || items.length === 0) return;
    const hash = window.location.hash;
    if (hash.startsWith('#c-')) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' });
  }, [items]);

  const top = useMemo(() => (items ?? []).filter((c) => !c.parentId), [items]);
  const repliesOf = (id: string) => (items ?? []).filter((c) => c.parentId === id);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { open('login'); return; }
    setBusy(true); setError(null); setNotice(null);
    const r = await bff<CommentItem>('POST', `social/posts/${postId}/comments`, { body: text, parentId: replyTo?.id ?? null });
    setBusy(false);
    if (!r.ok || !r.data) { setError(r.message); return; }
    setText(''); setReplyTo(null);
    if (r.data.status === 'held') setNotice('আপনার মন্তব্যটি পর্যালোচনার জন্য রাখা হয়েছে। অনুমোদন পেলে সবাই দেখতে পাবে।');
    await load();
  }

  async function remove(c: CommentItem) {
    if (!window.confirm('মন্তব্যটি মুছে ফেলবেন?')) return;
    const r = await bff('DELETE', `social/comments/${c.id}`);
    if (r.ok) await load(); else setError(r.message);
  }

  function renderOne(c: CommentItem, isReply: boolean) {
    return (
      <li key={c.id} id={`c-${c.id}`} className={`c-comment${isReply ? ' is-reply' : ''}${c.status === 'held' ? ' is-held' : ''}`}>
        <Avatar name={c.authorName} />
        <div className="c-comment__main">
          <div className="c-comment__head">
            <Link href={`/author/${c.authorUsername}`}>{c.authorName}</Link>
            <small>{timeAgoBn(c.createdAtUtc)}</small>
            {c.status === 'held' && <em className="c-comment__held">পর্যালোচনায় আছে</em>}
          </div>
          <p className="c-comment__body">{c.body}</p>
          <div className="c-comment__actions">
            {!isReply && c.status === 'visible' && <button type="button" onClick={() => { if (!user) open('login'); else setReplyTo(c); }}>উত্তর দিন</button>}
            {c.isMine && <button type="button" onClick={() => remove(c)}>মুছুন</button>}
          </div>
          {!isReply && (() => { const rs = repliesOf(c.id); return rs.length > 0 ? <ul className="c-comment__replies">{rs.map((x) => renderOne(x, true))}</ul> : null; })()}
        </div>
      </li>
    );
  }

  const total = (items ?? []).filter((c) => c.status === 'visible').length;

  return (
    <section className="c-comments" id="comments" data-section="post.comments">
      <h2 className="c-comments__title">মন্তব্য {items ? `(${toBn(total)})` : ''}</h2>

      {!enabled ? <p className="c-comments__off">এই লেখায় মন্তব্য বন্ধ আছে।</p>
        : !real ? <p className="c-comments__off">নমুনা লেখায় মন্তব্য করা যায় না।</p>
        : (
          <form className="c-comments__form" onSubmit={send}>
            {user ? (
              <>
                {replyTo && <div className="c-comments__replying">{replyTo.authorName}-কে উত্তর দিচ্ছেন <button type="button" onClick={() => setReplyTo(null)}>বাতিল</button></div>}
                <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={MAX} rows={3} placeholder="আপনার মতামত লিখুন…" aria-label="মন্তব্য" />
                <div className="c-comments__row">
                  <small>{toBn(text.length)}/{toBn(MAX)}</small>
                  <button type="submit" className="c-btn" disabled={busy || text.trim().length < 2}>{busy ? 'পাঠানো হচ্ছে…' : 'মন্তব্য করুন'}</button>
                </div>
              </>
            ) : (
              <div className="c-comments__login">
                <span>মন্তব্য করতে অ্যাকাউন্টে ঢুকুন। অ্যাকাউন্ট না থাকলে বিনা খরচে খুলে নিন।</span>
                <button type="button" className="c-btn" onClick={() => open('login')}>লগইন / নিবন্ধন</button>
              </div>
            )}
            {error && <p className="c-comments__error" role="alert">{error}</p>}
            {notice && <p className="c-comments__notice" role="status">{notice}</p>}
          </form>
        )}

      {items && items.length === 0 && real && enabled && <p className="c-comments__empty">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন।</p>}
      <ul className="c-comments__list">{top.map((c) => renderOne(c, false))}</ul>
    </section>
  );
}
