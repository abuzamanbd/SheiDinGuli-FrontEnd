'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { bff } from '@/lib/bff';
import { timeAgoBn, toBn } from '@/lib/bn';
import type { NotificationPage } from '@/lib/notifications';
import { Icon } from '../Icon';

/** Bell with an unread count and the latest notifications. Polls once a minute while the tab is open. */
export function NotificationBell({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationPage | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await bff<NotificationPage>('GET', 'notifications?pageSize=8');
    if (res.ok && res.data) setData(res.data);
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 60_000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  async function openItem(id: string, link: string | null, wasRead: boolean) {
    setOpen(false);
    if (!wasRead) await bff('POST', `notifications/${id}/read`);
    void load();
    if (link) router.push(link);
  }

  async function readAll() {
    await bff('POST', 'notifications/read-all');
    await load();
  }

  const unread = data?.unread ?? 0;
  return (
    <div className={`c-bell c-bell--${tone}`} ref={ref}>
      <button type="button" className="c-bell__btn" aria-label={unread ? `নোটিফিকেশন, ${toBn(unread)}টি নতুন` : 'নোটিফিকেশন'} aria-expanded={open} onClick={() => { setOpen(!open); if (!open) void load(); }}>
        <Icon name="bell" width={20} height={20} />
        {unread > 0 && <span className="c-bell__badge">{unread > 9 ? '৯+' : toBn(unread)}</span>}
      </button>
      {open && (
        <div className="c-bell__panel" role="dialog" aria-label="নোটিফিকেশন">
          <div className="c-bell__head"><b>নোটিফিকেশন</b>{unread > 0 && <button type="button" onClick={readAll}>সব পড়া হয়েছে</button>}</div>
          {!data || data.items.length === 0 ? (
            <p className="c-bell__empty">এখনো কোনো নোটিফিকেশন নেই।</p>
          ) : (
            <ul className="c-bell__list">
              {data.items.map((n) => (
                <li key={n.id}>
                  <button type="button" className={`c-bell__item${n.isRead ? '' : ' is-new'}`} onClick={() => openItem(n.id, n.linkUrl, n.isRead)}>
                    <span className="c-bell__title">{n.title}</span>
                    {n.body && <span className="c-bell__body">{n.body}</span>}
                    <small>{timeAgoBn(n.createdAtUtc)}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link href="/notifications" className="c-bell__all" onClick={() => setOpen(false)}>সব নোটিফিকেশন দেখুন</Link>
        </div>
      )}
    </div>
  );
}
