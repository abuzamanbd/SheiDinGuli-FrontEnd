'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { MenuNode, SiteSettings } from '@/lib/types';
import { Icon } from '../Icon';
import { Logo } from '../Logo';
import { useAuthModal } from '../auth/AuthModal';
import { UserMenu } from './UserMenu';
import { NotificationBell } from '../notifications/NotificationBell';
import { initialOf } from '@/lib/bn';

export function Header({ settings, menu }: { settings: SiteSettings; menu: MenuNode[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapRef = useRef<HTMLElement>(null);
  const auth = useAuthModal();

  const hoverOpen = (id: string) => { clearTimeout(timer.current); setOpenId(id); };
  const hoverClose = () => { timer.current = setTimeout(() => setOpenId(null), 120); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpenId(null); setDrawer(false); } };
    const onClick = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenId(null); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, []);
  useEffect(() => { document.body.classList.toggle('u-no-scroll', drawer); }, [drawer]);

  const close = () => { setOpenId(null); setDrawer(false); };

  return (
    <header className="s-header" data-section="layout.header" ref={wrapRef}>
      <div className="l-wrap s-header__inner">
        <Logo settings={settings} />
        <nav className="s-nav" aria-label="প্রধান মেনু" data-section="layout.menu">
          {menu.filter((m) => m.isActive !== false).map((item) => (
            <div key={item.id} className="s-nav__item" onMouseEnter={() => item.type !== 'link' && hoverOpen(item.id)} onMouseLeave={hoverClose}>
              {item.type === 'link' ? (
                <Link href={item.href} className="s-nav__link">{item.label}</Link>
              ) : (
                <button type="button" className={`s-nav__link${openId === item.id ? ' is-open' : ''}`} aria-expanded={openId === item.id} onClick={() => setOpenId(openId === item.id ? null : item.id)}>
                  {item.label}<Icon name="chevron" />
                </button>
              )}
              {item.type === 'dropdown' && openId === item.id && (
                <div className="s-nav__dropdown" data-section={`menu.${item.id}`}>
                  {item.links?.map((l) => <Link key={l.label} href={l.href} className="s-menu-link" onClick={close}>{l.label}</Link>)}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="s-header__tools">
          <button type="button" className="c-icon-btn s-header__search" aria-label="খুঁজুন"><Icon name="search" /></button>
          {auth.user ? <><NotificationBell /><UserMenu /></> : <button type="button" className="c-btn s-header__login" onClick={() => auth.open('login')}>লগইন / নিবন্ধন</button>}
          <button type="button" className="c-icon-btn s-header__burger" aria-label="মেনু খুলুন" onClick={() => setDrawer(true)}><Icon name="menu" /></button>
        </div>

        {/* Mega panels are positioned against the header, not the single item */}
        {menu.filter((m) => m.type === 'mega' && m.mega && openId === m.id).map((item) => {
          const m = item.mega!;
          return (
            <div key={item.id} className="s-mega" data-section={`menu.${item.id}`} onMouseEnter={() => hoverOpen(item.id)} onMouseLeave={hoverClose}>
              <div className={`s-mega__intro is-${m.tone}`}>
                <h3 className="s-mega__title">{m.title}</h3>
                <p className="s-mega__desc">{m.description}</p>
                <Link href={item.href} className="c-btn c-btn--white s-mega__cta" onClick={close}>{m.ctaLabel}</Link>
              </div>
              {m.columns.map((col) => (
                <div key={col.heading} className="s-mega__col">
                  <div className="s-mega__heading">{col.heading}</div>
                  {col.links.map((l) => <Link key={l.label} href={l.href} className="s-menu-link" onClick={close}>{l.label}<Icon name="arrowRight" /></Link>)}
                </div>
              ))}
              <div className="s-mega__side">
                <div className="s-mega__heading">{m.featured.heading}</div>
                {m.featured.items.map((f) => (
                  <Link key={f.title} href={f.href} className={`s-mega__post is-${f.kind}`} onClick={close}>
                    <span className={`s-mega__thumb${f.shape === 'round' ? ' s-mega__thumb--round' : ''}`}>{initialOf(f.title)}</span>
                    <span className="s-mega__post-text"><span className="s-mega__post-title">{f.title}</span><span className="s-mega__post-sub">{f.sub}</span></span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {drawer && (
        <div className="s-drawer" onMouseDown={(e) => e.target === e.currentTarget && setDrawer(false)}>
          <div className="s-drawer__panel" role="dialog" aria-modal="true" aria-label="মেনু">
            <div className="s-drawer__head"><span className="s-drawer__title">মেনু</span><button type="button" className="c-icon-btn" onClick={() => setDrawer(false)} aria-label="বন্ধ করুন"><Icon name="close" /></button></div>
            {menu.filter((m) => m.isActive !== false).map((item) => {
              if (item.type === 'link') return <Link key={item.id} href={item.href} className="s-drawer__link" onClick={close}>{item.label}</Link>;
              const links = item.type === 'dropdown' ? item.links ?? [] : item.mega!.columns.flatMap((c) => c.links);
              return (
                <div key={item.id} className="s-drawer__group">
                  <button type="button" className={`s-drawer__toggle${sub === item.id ? ' is-open' : ''}`} onClick={() => setSub(sub === item.id ? null : item.id)}>{item.label}<Icon name="chevron" /></button>
                  {sub === item.id && <div className="s-drawer__sub">{links.map((l) => <Link key={l.label} href={l.href} onClick={close}>{l.label}</Link>)}</div>}
                </div>
              );
            })}
            <div className="s-drawer__actions">
              {auth.user ? (
                <>
                  <Link href={`/author/${auth.user.username}`} className="c-btn" onClick={close}>আমার প্রোফাইল</Link>
                  <button type="button" className="c-btn c-btn--outline" onClick={() => { setDrawer(false); void auth.logout(); }}>লগআউট</button>
                </>
              ) : (
                <button type="button" className="c-btn" onClick={() => { setDrawer(false); auth.open('login'); }}>লগইন / নিবন্ধন</button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
