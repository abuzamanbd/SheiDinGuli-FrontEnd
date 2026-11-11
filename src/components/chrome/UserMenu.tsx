'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { initialOf } from '@/lib/bn';
import { Icon } from '../Icon';
import { isStaff } from '@/lib/auth/roles';
import { useAuthModal } from '../auth/AuthModal';

/** Shown in the header instead of the login button once the reader is signed in. */
export function UserMenu() {
  const { user, logout } = useAuthModal();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  if (!user) return null;
  return (
    <div className="s-user" ref={ref} data-section="layout.usermenu">
      <button type="button" className="s-user__button" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="c-initial">{initialOf(user.displayName)}</span>
        <span className="s-user__name">{user.displayName}</span>
        <Icon name="chevron" width={14} height={14} />
      </button>
      {open && (
        <div className="s-user__panel" role="menu">
          <div className="s-user__who"><strong>{user.displayName}</strong><span>@{user.username}</span></div>
          {isStaff(user) && <Link href="/admin" className="s-menu-link" role="menuitem" onClick={() => setOpen(false)}>অ্যাডমিন প্যানেল</Link>}
          <Link href="/panel" className="s-menu-link" role="menuitem" onClick={() => setOpen(false)}>লেখক প্যানেল</Link>
          <Link href="/write" className="s-menu-link" role="menuitem" onClick={() => setOpen(false)}>নতুন লেখা</Link>
          <Link href="/settings/profile" className="s-menu-link" role="menuitem" onClick={() => setOpen(false)}>প্রোফাইল সেটিংস</Link>
          <Link href={`/author/${user.username}`} className="s-menu-link" role="menuitem" onClick={() => setOpen(false)}>আমার প্রোফাইল</Link>
          <button type="button" className="s-menu-link s-user__logout" role="menuitem" onClick={() => { setOpen(false); void logout(); }}>লগআউট</button>
        </div>
      )}
    </div>
  );
}
