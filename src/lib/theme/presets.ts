import type { ThemePreset } from '@/lib/types';

/**
 * Sample themes. In production these come from the admin panel (the backend stores them).
 * A theme only lists the tokens that differ from the default look.
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'সাধারণ (সবুজ-লাল)',
    description: 'ডিফল্ট রং। বছরের বাকি সময় এটি দেখা যায়।',
    tokens: {}
  },
  {
    id: 'indigo',
    name: 'নীলাভ (ইন্ডিগো)',
    description: 'প্রথম নকশার (A) নীল-সবুজ রঙের ধাঁচ।',
    tokens: {
      'color.primary': '#0E6B57', 'color.primary-strong': '#0A5242', 'color.accent': '#D6452A', 'color.accent-bright': '#D6452A',
      'color.accent-soft': '#FCEBE6', 'color.page': '#F5F6FA', 'color.border': '#E4E7EF', 'color.border-soft': '#EEF0F5',
      'color.text': '#3D4560', 'color.text-muted': '#5F6780', 'color.heading': '#17203A',
      'color.topbar-bg': '#17203A', 'color.topbar-text': '#C9CEDD', 'color.topbar-cta-bg': '#0E6B57',
      'color.logo-text': '#17203A', 'color.logo-accent': '#0E6B57', 'color.logo-mark': '#0E6B57',
      'color.menu-link': '#17203A', 'color.menu-link-hover': '#0E6B57', 'color.menu-indicator': '#0E6B57',
      'color.submenu-top-line': '#0E6B57', 'color.submenu-heading': '#0E6B57', 'color.submenu-hover-bg': '#E3F2EE', 'color.submenu-hover-text': '#0E6B57',
      'color.submenu-text': '#17203A', 'color.submenu-side-bg': '#F5F6FA',
      'color.mega-story-bg': '#0E6B57', 'color.mega-poem-bg': '#3F4BA8', 'color.mega-memory-bg': '#7C4E0E', 'color.mega-neutral-bg': '#17203A',
      'color.button-bg': '#0E6B57', 'color.button-hover-bg': '#17203A',
      'color.dark-bg': '#17203A', 'color.dark-text': '#C9CEDD', 'color.band-bg': '#17203A',
      'color.footer-bg': '#17203A', 'color.footer-text': '#C9CEDD', 'color.footer-border': '#2C3657', 'color.footer-accent': '#0E6B57',
      'color.story': '#0E6B57', 'color.story-tint': '#E3F2EE', 'color.poem': '#3F4BA8', 'color.poem-tint': '#E9EBF8',
      'font.heading': "'Noto Serif Bengali', serif"
    }
  },
  {
    id: 'boishakh',
    name: 'পহেলা বৈশাখ',
    description: 'লাল-সাদার উৎসবের রং। ১৩–১৫ এপ্রিল নিজে থেকেই চালু হয়।',
    recurring: { from: '04-13', to: '04-15' },
    tokens: {
      'color.primary': '#C8102E', 'color.primary-strong': '#A00D25', 'color.accent': '#F5A100', 'color.accent-bright': '#F5A100',
      'color.accent-soft': '#FFF4D9', 'color.page': '#FFFBF3', 'color.topbar-bg': '#C8102E', 'color.topbar-text': '#FFFFFF',
      'color.topbar-cta-bg': '#F5A100', 'color.topbar-cta-text': '#3A1A00', 'color.logo-mark': '#C8102E', 'color.logo-accent': '#C8102E',
      'color.menu-link-hover': '#C8102E', 'color.menu-indicator': '#F5A100', 'color.submenu-top-line': '#F5A100',
      'color.submenu-heading': '#C8102E', 'color.submenu-hover-bg': '#FFF4D9', 'color.submenu-hover-text': '#C8102E',
      'color.button-bg': '#C8102E', 'color.button-hover-bg': '#A00D25', 'color.band-bg': '#A00D25', 'color.dark-bg': '#3A0A12',
      'color.footer-bg': '#3A0A12', 'color.footer-accent': '#F5A100', 'color.footer-border': '#5A1A24', 'color.footer-text': '#F3D6D9',
      'color.mega-story-bg': '#C8102E', 'color.mega-neutral-bg': '#3A0A12'
    }
  },
  {
    id: 'ekushey',
    name: 'একুশে ফেব্রুয়ারি',
    description: 'শোক ও শ্রদ্ধার কালো-লালের রং। ২০–২২ ফেব্রুয়ারি।',
    recurring: { from: '02-20', to: '02-22' },
    tokens: {
      'color.primary': '#1B1B1B', 'color.primary-strong': '#000000', 'color.accent': '#C8102E', 'color.accent-bright': '#C8102E',
      'color.topbar-bg': '#000000', 'color.topbar-text': '#EDEDED', 'color.topbar-cta-bg': '#C8102E', 'color.logo-mark': '#000000',
      'color.menu-link-hover': '#C8102E', 'color.button-bg': '#1B1B1B', 'color.button-hover-bg': '#C8102E', 'color.band-bg': '#111111',
      'color.dark-bg': '#111111', 'color.footer-bg': '#000000', 'color.footer-border': '#262626', 'color.footer-text': '#CFCFCF',
      'color.mega-story-bg': '#1B1B1B', 'color.mega-neutral-bg': '#000000', 'color.story': '#1B1B1B', 'color.story-tint': '#EFEFEF'
    }
  },
  {
    id: 'bijoy',
    name: 'বিজয় দিবস',
    description: 'সবুজ ও গাঢ় লালের বিজয়ের রং। ১৪–১৬ ডিসেম্বর।',
    recurring: { from: '12-14', to: '12-16' },
    tokens: {
      'color.primary': '#006A4E', 'color.accent': '#F42A41', 'color.topbar-bg': '#F42A41', 'color.topbar-text': '#FFFFFF',
      'color.topbar-cta-bg': '#006A4E', 'color.logo-mark': '#006A4E', 'color.band-bg': '#006A4E', 'color.footer-accent': '#F42A41'
    }
  }
];

const defaultPreset = THEME_PRESETS[0];

function inRecurring(now: Date, from: string, to: string): boolean {
  const md = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return from <= to ? md >= from && md <= to : md >= from || md <= to;
}

/** Picks the theme for today: a scheduled theme wins, otherwise the site's default theme. */
export function resolveTheme(presets: ThemePreset[], defaultThemeId: string, now: Date = new Date()): ThemePreset {
  const iso = now.toISOString().slice(0, 10);
  const scheduled = presets.find(
    (p) => (p.recurring && inRecurring(now, p.recurring.from, p.recurring.to)) || (p.range && iso >= p.range.from && iso <= p.range.to)
  );
  return scheduled ?? presets.find((p) => p.id === defaultThemeId) ?? defaultPreset;
}
