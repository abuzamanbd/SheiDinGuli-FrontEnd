'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { bff } from '@/lib/bff';
import { timeAgoBn, toBn } from '@/lib/bn';

interface Row { id: string; slug: string; title: string; authorName: string; authorUsername: string; kind: string; kindLabel: string; status: 'live' | 'hidden'; publishedAt: string | null; views: number; likes: number; comments: number }
interface Page { items: Row[]; total: number; live: number; hidden: number; page: number; pageSize: number }
type Filter = 'live' | 'hidden' | 'all';

const TABS: [Filter, string][] = [['live', 'সাইটে আছে'], ['hidden', 'সরানো'], ['all', 'সব']];

/** Posts that have been on the site. An editor can take one off the site and put it back; the text is never lost. */
export function PublishedPosts() {
  const [filter, setFilter] = useState<Filter>('live');
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [hiding, setHiding] = useState<Row | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    const q = new URLSearchParams({ filter, page: String(page), pageSize: '15' });
    if (term) q.set('search', term);
    const r = await bff<Page>('GET', `admin/posts?${q}`);
    if (r.ok && r.data) { setData(r.data); setError(null); } else setError(r.message);
  }, [filter, page, term]);
  useEffect(() => { void load(); }, [load]);

  async function show(row: Row) {
    setBusy(row.id);
    const r = await bff('POST', `admin/posts/${row.id}/show`);
    setBusy(null);
    if (r.ok) await load(); else setError(r.message);
  }

  async function confirmHide() {
    if (!hiding) return;
    setBusy(hiding.id);
    const r = await bff('POST', `admin/posts/${hiding.id}/hide`, { reason: reason.trim() || null });
    setBusy(null);
    if (r.ok) { setHiding(null); setReason(''); await load(); } else setError(r.message);
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className="p-admin__card" data-section="admin.posts">
      <div className="p-admin__card-head">
        <h2>সব লেখা</h2>
        <div className="p-admin__tabs" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={filter === id} className={filter === id ? 'is-on' : ''} onClick={() => { setFilter(id); setPage(1); }}>
              {label}{data ? ` · ${toBn(id === 'live' ? data.live : id === 'hidden' ? data.hidden : data.live + data.hidden)}` : ''}
            </button>
          ))}
        </div>
      </div>

      <form className="c-pubposts__search" onSubmit={(e) => { e.preventDefault(); setPage(1); setTerm(search); }}>
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="শিরোনাম বা লেখকের নাম খুঁজুন…" aria-label="খুঁজুন" />
        <button type="submit" className="c-btn c-btn--sm">খুঁজুন</button>
      </form>

      {error && <p className="p-admin__error" role="alert">{error}</p>}
      {!error && !data && <p className="p-admin__empty">লোড হচ্ছে…</p>}
      {data && data.items.length === 0 && <p className="p-admin__empty">এখানে কোনো লেখা নেই।</p>}

      {data && data.items.length > 0 && (
        <div className="p-admin__scroll">
          <table className="p-admin__table">
            <thead><tr><th scope="col">লেখা</th><th scope="col">ধরন</th><th scope="col">অবস্থা</th><th scope="col">পাঠ · পছন্দ · মন্তব্য</th><th scope="col"><span className="u-sr-only">কাজ</span></th></tr></thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id}>
                  <td><span className="p-admin__ttl">{r.title}</span><small>{r.authorName} · {r.publishedAt ? timeAgoBn(r.publishedAt) : '—'}</small></td>
                  <td>{r.kindLabel}</td>
                  <td><span className={`p-admin__pill${r.status === 'hidden' ? ' is-red' : ''}`}>{r.status === 'live' ? 'সাইটে আছে' : 'সরানো'}</span></td>
                  <td>{toBn(r.views)} · {toBn(r.likes)} · {toBn(r.comments)}</td>
                  <td className="c-pubposts__actions">
                    <Link href={`/post/${r.slug}`} target="_blank" className="c-btn c-btn--sm c-btn--outline">দেখুন</Link>
                    {r.status === 'live'
                      ? <button type="button" className="c-btn c-btn--sm" disabled={busy === r.id} onClick={() => { setHiding(r); setReason(''); }}>সাইট থেকে সরান</button>
                      : <button type="button" className="c-btn c-btn--sm" disabled={busy === r.id} onClick={() => show(r)}>আবার দেখান</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && pages > 1 && (
        <div className="c-pubposts__pager">
          <button type="button" className="c-btn c-btn--sm c-btn--outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>← আগের</button>
          <span>{toBn(page)} / {toBn(pages)}</span>
          <button type="button" className="c-btn c-btn--sm c-btn--outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>পরের →</button>
        </div>
      )}

      {hiding && (
        <div className="c-pubposts__modal" role="dialog" aria-modal="true" aria-label="লেখা সরান">
          <div className="c-pubposts__dialog">
            <h3>“{hiding.title}” সাইট থেকে সরাবেন?</h3>
            <p>লেখাটি পাঠকদের কাছে আর দেখা যাবে না। লেখা মুছে যাবে না, যেকোনো সময় আবার দেখানো যাবে। লেখক জানতে পারবেন।</p>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="কারণ (ঐচ্ছিক, লেখক দেখতে পাবেন)" maxLength={400} />
            <div className="c-pubposts__row">
              <button type="button" className="c-btn c-btn--outline" onClick={() => setHiding(null)}>বাতিল</button>
              <button type="button" className="c-btn" disabled={busy === hiding.id} onClick={confirmHide}>সরিয়ে দিন</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
