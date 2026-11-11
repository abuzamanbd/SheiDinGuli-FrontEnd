import Link from 'next/link';
import type { SiteSettings } from '@/lib/types';
import { Icon } from './Icon';

export function Logo({ settings }: { settings: SiteSettings }) {
  return (
    <Link href="/" className="s-logo" aria-label={settings.logoAlt}>
      {settings.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="s-logo__image" src={settings.logoUrl} alt={settings.logoAlt} />
      ) : (
        <>
          <span className="s-logo__mark"><Icon name="feather" /></span>
          <span className="s-logo__text">
            <span className="s-logo__name">{settings.siteNameFirst}<span className="s-logo__accent">{settings.siteNameAccent}</span></span>
            <span className="s-logo__tagline">{settings.tagline}</span>
          </span>
        </>
      )}
    </Link>
  );
}
