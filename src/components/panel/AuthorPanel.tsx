'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { bff } from '@/lib/bff';
import { timeAgoBn, toBn, formatCount } from '@/lib/bn';
import { STATUS_LABEL, type Dashboard, type PostsPage } from '@/lib/posts/api';
import { Icon } from '../Icon';

const FILTERS: [string, string][] = [['', 'সব'], ['published', 'প্রকাশিত'], ['review', 'পর্যালোচনায়'], ['changes', 'সংশোধন'], ['draft', 'খসড়া']];

export function AuthorPanel({ displayName, username, staff }: { displayName: string; username: string; staff: boolean }) {
  const router = useRouter();
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [list, setList] = useState<PostsPage | null>(null);

  useEffect(() => { void bff<Dashboard>('GET', 'posts/mine/dashboard').then((r) => (r.ok ? setDash(r.data) : setError(r.message))); }, []);
  useEffect(() => { void bff<PostsPage>('GET', `posts/mine?status=${filter}&pageSize=20`).then((r) => r.ok && setList(r.data)); }, [filter]);

  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); router.refresh(); }
  const t = dash?.totals;
  const max = Math.max(1, ...(dash?.last7Days.map((d) => d.views) ?? [1]));
  const stats = [
    { label: 'প্রকাশিত', value: t?.published, tone: 'green' }, { label: 'পর্যালোচনায়', value: t?.inReview, tone: 'amber' },
    { label: 'সংশোধন প্রয়োজন', value: t?.changesRequested, tone: 'red' }, { label: 'খসড়া', value: t?.drafts, tone: 'grey' }, { label: 'মোট পাঠ', value: t?.views, tone: 'blue' }
  ];
  const summary = t ? [t.changesRequested ? `আপনার ${toBn(t.changesRequested)}টি লেখায় সংশোধন প্রয়োজন` : null, t.inReview ? `${toBn(t.inReview)}টি সম্পাদকের পর্যালোচনায় আছে` : null].filter(Boolean).join(', আর ') : '';

  return (
    <div className="p-panel">
      <aside className="p-panel__side" aria-label="লেখক মেনু">
        <Link href="/" className="p-panel__brand"><span className="p-panel__logo"><Icon name="feather" width={18} height={18} /></span><span><b>গল্পকথা</b><small>লেখক প্যানেল</small></span></Link>
        <Link href="/write" className="c-btn"><Icon name="plus" width={18} height={18} />নতুন লেখা</Link>
        <nav className="p-panel__nav">
          <span className="p-panel__link is-on" aria-current="page"><Icon name="grid" width={19} height={19} />ড্যাশবোর্ড</span>
          {FILTERS.slice(1).map(([id, label]) => <button key={id} type="button" className="p-panel__link" onClick={() => setFilter(id)}><Icon name="book" width={19} height={19} />{label}</button>)}
          <Link href="/settings/profile" className="p-panel__link"><Icon name="user" width={19} height={19} />প্রোফাইল সেটিংস</Link>
          {staff && <Link href="/admin" className="p-panel__link"><Icon name="users" width={19} height={19} />অ্যাডমিন প্যানেল</Link>}
        </nav>
        <div className="p-panel__me">
          <span className="p-panel__initial">{displayName.slice(0, 1)}</span>
          <span><Link href={`/author/${username}`}>{displayName}</Link><small>@{username}</small></span>
          <button type="button" aria-label="লগআউট" onClick={logout}><Icon name="close" width={18} height={18} /></button>
        </div>
      </aside>

      <main className="p-panel__main">
        <div className="p-panel__hello">
          <div><h1>স্বাগতম, {displayName.split(' ')[0]}</h1><p>{summary || 'আজ কী লিখবেন? একটি নতুন লেখা শুরু করুন।'}</p></div>
          <Link href={`/author/${username}`} className="c-btn c-btn--ghost">পাবলিক প্রোফাইল</Link>
        </div>
        {error && <p className="p-admin__error" role="alert">{error}</p>}

        <div className="p-panel__stats">
          {stats.map((s) => <div key={s.label} className={`p-panel__stat is-${s.tone}`}><span>{s.label}</span><b>{s.value === undefined ? '—' : formatCount(s.value)}</b></div>)}
        </div>

        <div className="p-panel__cols">
          <div className="p-panel__col">
            {dash?.changesRequested && (
              <section className="p-panel__card is-alert" aria-labelledby="act-h">
                <h2 id="act-h"><Icon name="info" width={18} height={18} />আপনার পদক্ষেপ প্রয়োজন</h2>
                <div className="p-panel__action">
                  <div>
                    <b>{dash.changesRequested.title || 'শিরোনামহীন'}</b>
                    {dash.changesRequested.comment && <p><i>{dash.changesRequested.reviewerName ?? 'পর্যালোচক'}-এর মন্তব্য:</i> {dash.changesRequested.comment}</p>}
                  </div>
                  <Link href={`/write/${dash.changesRequested.postId}`} className="c-btn"><Icon name="pen" width={16} height={16} />সংশোধন করুন</Link>
                </div>
              </section>
            )}

            {dash && dash.inReview.length > 0 && (
              <section className="p-panel__card" aria-labelledby="trk-h">
                <h2 id="trk-h">পর্যালোচনার অগ্রগতি</h2>
                {dash.inReview.map((p) => (
                  <div key={p.postId} className="p-panel__track">
                    <div><b>{p.title}</b><small>{p.submittedAtUtc ? `জমা ${timeAgoBn(p.submittedAtUtc)}` : ''}</small></div>
                    <ol>{['জমা', 'স্বয়ংক্রিয় যাচাই', 'পর্যালোচনা', 'প্রকাশ'].map((l, i) => <li key={l} className={i < 2 ? 'is-done' : i === 2 ? 'is-now' : ''}><span>{i < 2 ? '✓' : i === 2 ? '•' : ''}</span>{l}</li>)}</ol>
                  </div>
                ))}
              </section>
            )}

            <section className="p-panel__card" aria-labelledby="posts-h">
              <div className="p-panel__card-head">
                <h2 id="posts-h">আমার লেখা</h2>
                <div role="group" aria-label="অবস্থা অনুযায়ী" className="p-admin__tabs">
                  {FILTERS.map(([id, label]) => <button key={id} type="button" aria-pressed={filter === id} className={filter === id ? 'is-on' : ''} onClick={() => setFilter(id)}>{label}</button>)}
                </div>
              </div>
              {list && list.items.length === 0 && <p className="p-admin__empty">এখানে এখনো কোনো লেখা নেই। <Link href="/write">প্রথম লেখাটি শুরু করুন →</Link></p>}
              {list && list.items.length > 0 && (
                <div className="p-admin__scroll">
                  <table className="p-admin__table">
                    <thead><tr><th scope="col">শিরোনাম</th><th scope="col">অবস্থা</th><th scope="col">তারিখ</th><th scope="col">পাঠ</th><th scope="col"><span className="u-sr-only">কাজ</span></th></tr></thead>
                    <tbody>
                      {list.items.map((p) => {
                        const st = STATUS_LABEL[p.status] ?? STATUS_LABEL.Draft;
                        return (
                          <tr key={p.id}>
                            <td>{p.status === 'Published' ? <Link href={`/post/${p.slug}`} className="p-admin__ttl">{p.title}</Link> : <span className="p-admin__ttl">{p.title || 'শিরোনামহীন খসড়া'}</span>}<small>{p.postType}</small></td>
                            <td><span className={`p-admin__pill is-${st.tone}`}>{st.label}</span></td>
                            <td>{timeAgoBn(p.updatedAtUtc)}</td>
                            <td>{p.status === 'Published' ? formatCount(p.views) : '—'}</td>
                            <td><Link href={`/write/${p.id}`} aria-label="সম্পাদনা করুন" className="p-panel__edit"><Icon name="pen" width={15} height={15} /></Link></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <div className="p-panel__col">
            <section className="p-panel__card" aria-labelledby="rd-h">
              <h2 id="rd-h">গত ৭ দিনের পাঠ</h2>
              <div className="p-panel__reads" role="img" aria-label="সাত দিনের পাঠ সংখ্যা">
                {(dash?.last7Days ?? []).map((d) => (
                  <div key={d.date}><div className="p-panel__bar" style={{ height: `${Math.max(4, Math.round((d.views / max) * 100))}px` }} title={`${toBn(d.views)} পাঠ`} /><span>{new Date(d.date).toLocaleDateString('bn-BD', { weekday: 'short' })}</span></div>
                ))}
              </div>
            </section>
            <section className="p-panel__card">
              <h2>লেখার পরামর্শ</h2>
              <p>শিরোনাম ছোট ও স্পষ্ট রাখুন, আর সংক্ষিপ্ত ভূমিকায় পাঠককে একটা প্রশ্ন দিন — তালিকায় এটাই সবার আগে চোখে পড়ে।</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
