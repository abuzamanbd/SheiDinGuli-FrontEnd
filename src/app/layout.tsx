import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/main.scss';
import { api } from '@/lib/api';
import { getThemeOverridesFromApi } from '@/lib/api/http';
import { GOOGLE_FONTS_URL, buildThemeCss } from '@/lib/theme/tokens';
import { resolveTheme } from '@/lib/theme/presets';
import { AuthModalProvider } from '@/components/auth/AuthModal';
import { getSession } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'গল্পকথা — বাংলায় লিখুন, বাংলায় পড়ুন', description: 'গল্প, কবিতা আর শৈশবের স্মৃতির বাংলা প্ল্যাটফর্ম।' };
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [settings, themes, user, overrides] = await Promise.all([api.getSettings(), api.getThemes(), getSession(), getThemeOverridesFromApi()]);
  const theme = resolveTheme(themes, settings.defaultThemeId);
  return (
    <html lang="bn" data-theme={theme.id}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
        <style id="site-theme" dangerouslySetInnerHTML={{ __html: buildThemeCss({ ...theme.tokens, ...overrides }) }} />
      </head>
      <body>
        <AuthModalProvider siteName={`${settings.siteNameFirst}${settings.siteNameAccent}`} user={user}>
          {children}
        </AuthModalProvider>
      </body>
    </html>
  );
}
