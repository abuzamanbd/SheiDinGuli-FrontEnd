import Link from 'next/link';
import type { SiteSettings } from '@/lib/types';

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="s-footer" data-section="layout.footer">
      <div className="l-wrap s-footer__inner">
        <div className="s-footer__top">
          <div className="s-footer__brand">
            <div className="s-footer__name">{settings.siteNameFirst}<span className="s-footer__accent">{settings.siteNameAccent}</span></div>
            <p className="s-footer__about">{settings.footerAbout}</p>
          </div>
          <div className="s-footer__groups">
            {settings.footerGroups.map((g) => (
              <div key={g.heading} className="s-footer__group">
                <span className="s-footer__heading">{g.heading}</span>
                {g.links.map((l) => <Link key={l.label} href={l.href} className="s-footer__link">{l.label}</Link>)}
              </div>
            ))}
          </div>
        </div>
        <div className="s-footer__bottom"><span>{settings.copyright}</span><span>{settings.footerNote}</span></div>
      </div>
    </footer>
  );
}
