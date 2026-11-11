import Link from 'next/link';
import type { SiteSettings } from '@/lib/types';
import { banglaDate, todayLongBn } from '@/lib/bn';

export function TopBar({ settings }: { settings: SiteSettings }) {
  if (!settings.topBarEnabled) return null;
  const now = new Date();
  return (
    <div className="s-topbar" data-section="layout.topbar">
      <div className="l-wrap s-topbar__inner">
        <span className="s-topbar__date">{todayLongBn(now)} · {banglaDate(now)}</span>
        <span className="s-topbar__right">
          {settings.topBarLinks.map((l) => <Link key={l.href} href={l.href} className="s-topbar__link s-topbar__hide-sm">{l.label}</Link>)}
        </span>
      </div>
    </div>
  );
}
