'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { bff } from '@/lib/bff';
import { timeAgoBn, toBn } from '@/lib/bn';
import { NOTIFICATION_TONE, type NotificationPage } from '@/lib/notifications';
import { Icon } from '../Icon';

/** Full list of the signed-in user's notifications. */
export function NotificationsPage() {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<NotificationPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await bff<NotificationPage>('GET', `notifications?pageSize=20&page=${page}${unreadOnly ? '&unreadOnly=true' : ''}`);
    if (!res.ok || !res.data) return setError(res.ok ? 'লোড করা যায়নি।' : res.message);
    setError(null); setData(res.data);
  }, [page, unreadOnly]);
  useEffect(() => { void load(); }, [load]);

  async function open(id: string, link: string | null, wasRead: boolean) {
    if (!wasRead) await bff('POST', `notifications/${id}/read`);
    if (link) router.push(link); else void load();
  }
  async function readAll() { await bff('POST', 'notifications/read-all'); await load(); }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  return (
    <div className="p-profile">
      <header className="p-profile__top">
        <Link href="/panel" className="p-profile__back"><Icon name="chevron" width={14} height={14} />লেখক প্যানেল</Link>
        <button type="button" className="c-btn c-btn--ghost" onClick={readAll} disabled={!data?.unread}>সব পড়া হয়েছে</button>
      </header>
      <main className="p-profile__main">
        <h1>নোটিফিকেশন</h1>
        <p className="p-profile__sub">{data ? `${toBn(data.unread)}টি নতুন` : 'লোড হচ্ছে…'}</p>
        <div className="p-admin__tabs" role="tablist" style={{ alignSelf: 'flex-start' }}>
          <button type="button" role="tab" aria-selected={!unreadOnly} className={!unreadOnly ? 'is-on' : ''} onClick={() => { setUnreadOnly(false); setPage(1); }}>সব</button>
          <button type="button" role="tab" aria-selected={unreadOnly} className={unreadOnly ? 'is-on' : ''} onClick={() => { setUnreadOnly(true); setPage(1); }}>নতুন</button>
        </div>
        {error && <p className="c-ob__error" role="alert">{error}</p>}
        {data && data.items.length === 0 && <p className="p-admin__empty">কোনো নোটিফিকেশন নেই।</p>}
        {data && data.items.length > 0 && (
          <ul className="c-notes">
            {data.items.map((n) => {
              const t = NOTIFICATION_TONE[n.type];
              return (
                <li key={n.id}>
                  <button type="button" className={`c-notes__item${n.isRead ? '' : ' is-new'}`} onClick={() => open(n.id, n.linkUrl, n.isRead)}>
                    <span className="c-notes__main">
                      <span className="c-notes__title">{t && <em className={`c-notes__tag is-${t.tone}`}>{t.label}</em>}{n.title}</span>
                      {n.body && <span className="c-notes__body">{n.body}</span>}
                    </span>
                    <small>{timeAgoBn(n.createdAtUtc)}</small>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {pages > 1 && (
          <div className="p-profile__foot" style={{ justifyContent: 'center', gap: 10 }}>
            <button type="button" className="c-btn c-btn--ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>আগের</button>
            <span style={{ alignSelf: 'center' }}>{toBn(page)} / {toBn(pages)}</span>
            <button type="button" className="c-btn c-btn--ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>পরের</button>
          </div>
        )}
      </main>
    </div>
  );
}
