'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { bff } from '@/lib/bff';
import { timeAgoBn, toBn } from '@/lib/bn';
import { highlightHtml } from '@/lib/admin/highlight';
import type { AdminRoleId } from '@/lib/auth/roles';
import type { QueueName, QueuePage, ReviewItem } from '@/lib/admin/types';
import { Icon, type IconName } from '../Icon';
import { HeldComments } from '../social/HeldComments';
import { AccessPanel } from './AccessPanel';
import { NotificationBell } from '../notifications/NotificationBell';

interface Props { roleId: AdminRoleId; displayName: string; username: string }

const ROLES: Record<AdminRoleId, { label: string; color: string; desc: string }> = {
  super: { label: 'সুপার অ্যাডমিন', color: '#D7263D', desc: 'পুরো প্ল্যাটফর্মের সারসংক্ষেপ — দল, পর্যালোচনা আর নীতিমালা এক জায়গায়।' },
  content: { label: 'কনটেন্ট ম্যানেজার', color: '#3F4BA8', desc: 'হোমপেজ, ধরন-উপধরন আর প্রকাশিত লেখার সাজসজ্জা আপনার দায়িত্বে।' },
  editor: { label: 'সম্পাদক', color: '#006A4E', desc: 'পর্যালোচনা সারি, চিহ্নিত লেখা আর চূড়ান্ত প্রকাশের সিদ্ধান্ত।' },
  reviewer: { label: 'পর্যালোচক', color: '#0E7490', desc: 'আপনার জন্য নির্ধারিত লেখাগুলো পড়ুন ও সুপারিশ দিন।' },
  policy: { label: 'নীতিমালা ব্যবস্থাপক', color: '#9A6212', desc: 'শব্দ তালিকা, চিহ্নিত লেখা আর পাঠকের অভিযোগ দেখুন।' },
  other: { label: 'অ্যাডমিন', color: '#5E6A66', desc: 'আপনার ভূমিকার জন্য নির্ধারিত কাজগুলো এখানে দেখা যাবে।' }
};

type MenuKey = 'dash' | 'queue' | 'flag' | 'posts' | 'authors' | 'cat' | 'words' | 'home' | 'users' | 'report' | 'gear';
const MENU: Record<MenuKey, [string, IconName]> = {
  dash: ['ড্যাশবোর্ড', 'grid'], queue: ['পর্যালোচনা সারি', 'list'], flag: ['চিহ্নিত লেখা', 'flag'], posts: ['সব লেখা', 'book'],
  authors: ['লেখক', 'user'], cat: ['ধরন ও উপধরন', 'grid'], words: ['নীতিমালা শব্দ তালিকা', 'list'], home: ['হোমপেজ সাজানো', 'home'],
  users: ['অ্যাডমিন ও ভূমিকা', 'users'], report: ['অভিযোগ ও মন্তব্য', 'info'], gear: ['সেটিংস', 'palette']
};
const MENU_BY_ROLE: Record<AdminRoleId, MenuKey[]> = {
  super: ['dash', 'queue', 'flag', 'posts', 'authors', 'cat', 'words', 'home', 'users', 'report', 'gear'],
  content: ['dash', 'posts', 'cat', 'home', 'authors', 'report'],
  editor: ['dash', 'queue', 'flag', 'posts', 'authors'],
  reviewer: ['dash', 'queue'],
  policy: ['dash', 'flag', 'words', 'report'],
  other: ['dash']
};
const CAN_REVIEW: AdminRoleId[] = ['super', 'editor', 'reviewer', 'policy'];
const TABS: [QueueName, string][] = [['Pending', 'নতুন'], ['Flagged', 'চিহ্নিত'], ['Escalated', 'উচ্চ পর্যায়ে'], ['ReReview', 'পুনরায় যাচাই']];
const greeting = (h: number) => (h < 5 ? 'শুভ রাত্রি' : h < 12 ? 'শুভ সকাল' : h < 15 ? 'শুভ দুপুর' : h < 18 ? 'শুভ বিকাল' : h < 20 ? 'শুভ সন্ধ্যা' : 'শুভ রাত্রি');

export function AdminDashboard({ roleId, displayName, username }: Props) {
  const router = useRouter();
  const role = ROLES[roleId];
  const canReview = CAN_REVIEW.includes(roleId);
  const [tab, setTab] = useState<QueueName>(roleId === 'policy' ? 'Flagged' : 'Pending');
  const [page, setPage] = useState<QueuePage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(canReview);
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [view, setView] = useState<'dash' | 'users' | 'comments'>('dash');
  const [now, setNow] = useState<{ greet: string; date: string } | null>(null);

  useEffect(() => {
    const d = new Date();
    setNow({ greet: greeting(d.getHours()), date: d.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) });
  }, []);

  const load = useCallback(async (q: QueueName) => {
    if (!canReview) return;
    setLoading(true);
    const res = await bff<QueuePage>('GET', `review/queue?queue=${q}&pageSize=20`);
    setLoading(false);
    if (!res.ok) return setLoadError(res.message);
    setLoadError(null);
    setPage(res.data);
  }, [canReview]);
  useEffect(() => { void load(tab); }, [tab, load]);

  const counts = page?.counts;
  const n = (v: number | undefined) => (v === undefined ? '—' : toBn(v));
  const stats: { label: string; value: string; note: string; icon: IconName; tone: string }[] = canReview ? [
    { label: 'অপেক্ষমাণ লেখা', value: n(counts?.pending), note: 'নতুন জমা পড়া', icon: 'clock', tone: 'amber' },
    { label: 'চিহ্নিত লেখা', value: n(counts?.flagged), note: 'নীতিমালা শব্দে আটকানো', icon: 'flag', tone: 'red' },
    { label: 'উচ্চ পর্যায়ে', value: n(counts?.escalated), note: 'সম্পাদকের সিদ্ধান্ত চাই', icon: 'info', tone: 'blue' },
    { label: 'পুনরায় যাচাই', value: n(counts?.reReview), note: 'প্রকাশিত লেখা, তালিকা বদলের পর', icon: 'eye', tone: 'green' }
  ] : [
    { label: 'প্রকাশিত লেখা', value: '—', note: 'শীঘ্রই সংযুক্ত হবে', icon: 'book', tone: 'green' },
    { label: 'ধরন / উপধরন', value: '—', note: 'শীঘ্রই সংযুক্ত হবে', icon: 'grid', tone: 'blue' },
    { label: 'অভিযোগ', value: '—', note: 'শীঘ্রই সংযুক্ত হবে', icon: 'info', tone: 'red' },
    { label: 'পাঠ', value: '—', note: 'শীঘ্রই সংযুক্ত হবে', icon: 'eye', tone: 'amber' }
  ];

  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); router.refresh(); }
  const menu = MENU_BY_ROLE[roleId];
  const soon = (k: MenuKey) => !['dash', 'queue', 'flag', 'users'].includes(k) && !(k === 'report' && canReview);
  const activeKey: MenuKey = view === 'users' ? 'users' : view === 'comments' ? 'report' : 'dash';
  const goMenu = (k: MenuKey) => {
    setView(k === 'users' ? 'users' : k === 'report' ? 'comments' : 'dash');
    if (k === 'queue') setTab('Pending');
    if (k === 'flag') setTab('Flagged');
  };

  return (
    <div className="p-admin">
      <aside className="p-admin__side" aria-label="অ্যাডমিন মেনু">
        <Link href="/" className="p-admin__brand">
          <span className="p-admin__logo"><Icon name="feather" width={20} height={20} /></span>
          <span><b>গল্পকথা</b><small>অ্যাডমিন প্যানেল</small></span>
        </Link>
        <div className="p-admin__role"><span style={{ background: role.color }} /><span><small>আপনার ভূমিকা</small><b>{role.label}</b></span></div>
        <nav className="p-admin__nav">
          {menu.map((k) => (
            <button key={k} type="button" className={`p-admin__link${k === activeKey ? ' is-on' : ''}`} aria-current={k === activeKey ? 'page' : undefined}
              aria-disabled={soon(k) || undefined} title={soon(k) ? 'এই পাতাটি শীঘ্রই আসছে' : undefined} onClick={() => !soon(k) && goMenu(k)}>
              <Icon name={MENU[k][1]} width={19} height={19} /><span>{MENU[k][0]}</span>
              {k === 'queue' && counts && <em>{toBn(counts.pending)}</em>}
              {k === 'flag' && counts && <em className="is-hot">{toBn(counts.flagged)}</em>}
            </button>
          ))}
        </nav>
        <div className="p-admin__side-foot">
          <Link href="/" className="p-admin__link"><Icon name="link" width={19} height={19} /><span>সাইট দেখুন</span></Link>
          <Link href="/panel" className="p-admin__link"><Icon name="pen" width={19} height={19} /><span>আমার লেখক প্যানেল</span></Link>
          <button type="button" className="p-admin__link" onClick={logout}><Icon name="close" width={19} height={19} /><span>লগআউট</span></button>
        </div>
      </aside>

      <div className="p-admin__main">
        <header className="p-admin__top">
          <span className="p-admin__user"><span className="p-admin__initial" style={{ background: role.color }}>{displayName.slice(0, 1)}</span><span className="p-admin__who"><b>{displayName}</b><small>@{username} · {role.label}</small></span></span>
          <NotificationBell />
        </header>
        <main className="p-admin__content">
          <div className="p-admin__hello">
            <div><h1>{now?.greet ?? 'স্বাগতম'}, {displayName.split(' ')[0]}</h1><p>{role.desc}</p></div>
            {now && <span className="p-admin__date">{now.date}</span>}
          </div>

          {view === 'users' ? <AccessPanel selfUsername={username} /> : view === 'comments' ? <HeldComments /> : <>
          <div className="p-admin__stats">
            {stats.map((s) => (
              <div key={s.label} className={`p-admin__stat is-${s.tone}`}>
                <span className="p-admin__stat-top"><span>{s.label}</span><span className="p-admin__stat-icon"><Icon name={s.icon} width={17} height={17} /></span></span>
                <b>{s.value}</b><small>{s.note}</small>
              </div>
            ))}
          </div>

          {canReview ? (
            <section className="p-admin__card" aria-labelledby="q-h">
              <div className="p-admin__card-head">
                <h2 id="q-h">পর্যালোচনা সারি</h2>
                <div className="p-admin__tabs" role="tablist">
                  {TABS.map(([id, label]) => {
                    const c = counts && (id === 'Pending' ? counts.pending : id === 'Flagged' ? counts.flagged : id === 'Escalated' ? counts.escalated : counts.reReview);
                    return <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-on' : ''} onClick={() => setTab(id)}>{label}{c !== undefined && c > 0 ? ` · ${toBn(c)}` : ''}</button>;
                  })}
                </div>
              </div>
              {loadError && <p className="p-admin__error" role="alert">{loadError}</p>}
              {!loadError && loading && !page && <p className="p-admin__empty">লোড হচ্ছে…</p>}
              {!loadError && page && page.items.length === 0 && <p className="p-admin__empty">এই সারিতে এখন কোনো লেখা নেই। 🎉</p>}
              {page && page.items.length > 0 && (
                <div className="p-admin__scroll">
                  <table className="p-admin__table">
                    <thead><tr><th scope="col">লেখা</th><th scope="col">ধরন</th><th scope="col">অবস্থা</th><th scope="col">জমা</th><th scope="col"><span className="u-sr-only">কাজ</span></th></tr></thead>
                    <tbody>
                      {page.items.map((q) => (
                        <tr key={q.taskId}>
                          <td><span className="p-admin__ttl">{q.title || 'শিরোনামহীন'}</span><small>{q.authorName} · {toBn(q.words)} শব্দ</small></td>
                          <td>{q.postType}</td>
                          <td>
                            <span className={`p-admin__pill${q.matchCount > 0 ? ' is-red' : q.isRevisionOfPublished ? ' is-amber' : ''}`}>
                              {q.matchCount > 0 ? `চিহ্নিত · ${toBn(q.matchCount)} শব্দ` : q.isRevisionOfPublished ? 'সংশোধিত সংস্করণ' : 'নতুন'}
                            </span>
                            {q.taskStatus === 'Claimed' && <small> · নেওয়া হয়েছে</small>}
                          </td>
                          <td>{q.submittedAtUtc ? timeAgoBn(q.submittedAtUtc) : '—'}</td>
                          <td><button type="button" className="c-btn c-btn--sm" onClick={() => setOpenTask(q.taskId)}>পর্যালোচনা</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : (
            <section className="p-admin__card"><p className="p-admin__empty">আপনার ভূমিকার জন্য নির্ধারিত পাতাগুলো পরের ধাপে যুক্ত হবে। পর্যালোচনার অনুমতি এই ভূমিকায় নেই।</p></section>
          )}

          <section className="p-admin__soon" aria-label="আসছে">
            <Icon name="info" width={18} height={18} />
            <span>শব্দ তালিকা, হোমপেজ সাজানো, ধরন-উপধরন, অ্যাডমিন ও ভূমিকা, অভিযোগ — এই অংশগুলো ডিজাইন অনুযায়ী ধাপে ধাপে যুক্ত হবে।</span>
          </section>
          </>}
        </main>
      </div>

      {openTask && <ReviewDrawer taskId={openTask} roleId={roleId} onClose={() => setOpenTask(null)} onDone={() => { setOpenTask(null); void load(tab); }} />}
    </div>
  );
}

function ReviewDrawer({ taskId, roleId, onClose, onDone }: { taskId: string; roleId: AdminRoleId; onClose: () => void; onDone: () => void }) {
  const [item, setItem] = useState<ReviewItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    void bff<ReviewItem>('GET', `review/tasks/${taskId}`).then((r) => { if (!live) return; if (r.ok) setItem(r.data); else setError(r.message); });
    return () => { live = false; };
  }, [taskId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('u-no-scroll');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('u-no-scroll'); };
  }, [onClose]);

  async function decide(decision: 'Approve' | 'RequestChanges' | 'Reject' | 'Escalate') {
    if ((decision === 'RequestChanges' || decision === 'Reject') && !note.trim()) return setError('লেখককে জানাতে একটি মন্তব্য লিখুন।');
    setBusy(true); setError(null);
    const res = await bff('POST', `review/tasks/${taskId}/decision`, { decision, comment: note.trim() || null });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    onDone();
  }

  const body = item ? highlightHtml(item.bodyHtml, item.matches.map((m) => m.text)) : '';
  const hasFlags = !!item && item.matches.length > 0;
  return (
    <div className="p-admin__overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="p-admin__drawer" role="dialog" aria-modal="true" aria-labelledby="dr-title">
        <div className="p-admin__drawer-head">
          <div>
            <small>{item ? `${item.postType}${item.category ? ` · ${item.category}` : ''}` : ''}</small>
            <h2 id="dr-title">{item?.title || (error ? 'লেখাটি খোলা যায়নি' : 'লোড হচ্ছে…')}</h2>
            {item && <small>{item.authorName}{item.submittedAtUtc ? ` · জমা ${timeAgoBn(item.submittedAtUtc)}` : ''}</small>}
          </div>
          <button type="button" className="c-icon-btn" onClick={onClose} aria-label="বন্ধ করুন"><Icon name="close" /></button>
        </div>
        <div className="p-admin__drawer-body">
          {hasFlags && (
            <div className="p-admin__notice"><b>স্বয়ংক্রিয় যাচাই:</b> {toBn(item!.matches.length)}টি শব্দ নীতিমালার তালিকায় পাওয়া গেছে ({[...new Set(item!.matches.map((m) => m.listName))].join(', ')})। প্রসঙ্গ দেখে সিদ্ধান্ত নিন — সব ক্ষেত্রে আপত্তিকর নাও হতে পারে।</div>
          )}
          {item && (
            <>
              {item.excerpt && <p className="p-admin__excerpt">{item.excerpt}</p>}
              <div className={`p-admin__text${item.poemMode ? ' is-poem' : ''}`} dangerouslySetInnerHTML={{ __html: body }} />
              {item.history.length > 0 && (
                <div className="p-admin__history"><b>আগের সিদ্ধান্ত</b>
                  {item.history.map((h, i) => <p key={i}>{h.reviewerName} — {h.decision}{h.comment ? `: ${h.comment}` : ''}</p>)}
                </div>
              )}
              <div>
                <label htmlFor="dr-note" className="c-ob__legend">লেখকের জন্য মন্তব্য</label>
                <textarea id="dr-note" className="c-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="সংশোধন চাইলে কী বদলাতে হবে তা লিখুন — লেখক তাঁর প্যানেলে দেখতে পাবেন" />
              </div>
            </>
          )}
          {error && <p className="p-admin__error" role="alert">{error}</p>}
        </div>
        {item && (
          <div className="p-admin__drawer-foot">
            <button type="button" className="c-btn" disabled={busy} onClick={() => decide('Approve')}>{roleId === 'reviewer' ? 'অনুমোদন ও প্রকাশ' : 'অনুমোদন ও প্রকাশ'}</button>
            <button type="button" className="c-btn c-btn--ghost" disabled={busy} onClick={() => decide('RequestChanges')}>সংশোধনে ফেরত</button>
            <button type="button" className="c-btn c-btn--ghost" disabled={busy} onClick={() => decide('Reject')}>বাতিল</button>
            {item.queue !== 'Escalated' && <button type="button" className="c-btn c-btn--ghost" disabled={busy} onClick={() => decide('Escalate')}>উচ্চ পর্যায়ে পাঠান</button>}
          </div>
        )}
      </div>
    </div>
  );
}
