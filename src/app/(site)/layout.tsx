import type { ReactNode } from 'react';
import { api } from '@/lib/api';
import { TopBar } from '@/components/chrome/TopBar';
import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';

/** The public site: top bar, header with menu, footer. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, menu] = await Promise.all([api.getSettings(), api.getMenu()]);
  return (
    <div className="l-page">
      <TopBar settings={settings} />
      <Header settings={settings} menu={menu} />
      <main className="l-main">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
