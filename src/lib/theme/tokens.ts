/**
 * THE list of things an admin can change about the look of the site.
 *
 * Every token becomes a CSS variable (e.g. "color.primary" -> --color-primary). The SCSS files only
 * ever read these variables, so changing a value here (or later, in the admin panel) changes the whole
 * site without touching CSS. The `group` and `label` fields are what the admin screen will show.
 */

export type TokenType = 'color' | 'font' | 'size';

export interface TokenDef {
  key: string;
  label: string;
  hint?: string;
  group: TokenGroupKey;
  type: TokenType;
  default: string;
}

export type TokenGroupKey = 'brand' | 'page' | 'topbar' | 'header' | 'menu' | 'submenu' | 'button' | 'panel' | 'footer' | 'kinds' | 'fonts' | 'shape';

export const TOKEN_GROUPS: { key: TokenGroupKey; label: string; hint: string }[] = [
  { key: 'brand', label: 'মূল রং', hint: 'পুরো সাইটের প্রধান ও গুরুত্বের রং' },
  { key: 'page', label: 'পেজ ও লেখা', hint: 'পেছনের রং, কার্ড, লেখার রং' },
  { key: 'topbar', label: 'টপ বার', hint: 'একদম ওপরের সরু বার' },
  { key: 'header', label: 'হেডার', hint: 'লোগো ও মেনুর ওপরের অংশ' },
  { key: 'menu', label: 'মেনু', hint: 'প্রধান মেনুর লিংক' },
  { key: 'submenu', label: 'সাবমেনু', hint: 'মেনুর নিচে খোলা বড় মেনু ও ড্রপডাউন' },
  { key: 'button', label: 'বোতাম', hint: 'প্রধান বোতাম' },
  { key: 'panel', label: 'গাঢ় ব্লক', hint: 'শীর্ষ লেখার গাঢ় বক্স ও কবিতার ব্যান্ড' },
  { key: 'footer', label: 'ফুটার', hint: 'পেজের একদম নিচের অংশ' },
  { key: 'kinds', label: 'লেখার ধরনের রং', hint: 'গল্প, কবিতা ও স্মৃতিকথার আলাদা রং' },
  { key: 'fonts', label: 'ফন্ট', hint: 'লেখার ধরন ও আকার' },
  { key: 'shape', label: 'আকৃতি', hint: 'কোণের গোলাকার ভাব' }
];

/** Fonts loaded by the site. An admin can only choose from these (keeps the site fast). */
export const FONT_CHOICES: { label: string; value: string }[] = [
  { label: 'হিন্দ শিলিগুড়ি (আধুনিক, সহজপাঠ্য)', value: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" },
  { label: 'নোটো সানস বাংলা (পরিষ্কার)', value: "'Noto Sans Bengali', sans-serif" },
  { label: 'আনেক বাংলা (আধুনিক)', value: "'Anek Bangla', 'Noto Sans Bengali', sans-serif" },
  { label: 'তিরো বাংলা (ক্লাসিক সেরিফ)', value: "'Tiro Bangla', serif" },
  { label: 'নোটো সেরিফ বাংলা (সেরিফ)', value: "'Noto Serif Bengali', serif" },
  { label: 'বালু দা ২ (গোলাকার, হালকা মেজাজ)', value: "'Baloo Da 2', 'Noto Sans Bengali', sans-serif" }
];

/** Google Fonts URL for every font in FONT_CHOICES. */
export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400;500;600;700&family=Baloo+Da+2:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Tiro+Bangla:ital@0;1&display=swap';

export const TOKENS: TokenDef[] = [
  // brand
  { key: 'color.primary', label: 'প্রধান রং', hint: 'লোগো, বোতাম, লিংক', group: 'brand', type: 'color', default: '#006A4E' },
  { key: 'color.primary-strong', label: 'প্রধান রং (গাঢ়)', group: 'brand', type: 'color', default: '#00563F' },
  { key: 'color.accent', label: 'গুরুত্বের রং', hint: 'হোভার, নিচের দাগ, হাইলাইট', group: 'brand', type: 'color', default: '#D7263D' },
  { key: 'color.accent-bright', label: 'গুরুত্বের রং (উজ্জ্বল)', group: 'brand', type: 'color', default: '#F42A41' },
  { key: 'color.accent-soft', label: 'গুরুত্বের রং (হালকা)', group: 'brand', type: 'color', default: '#FDECEE' },

  // page
  { key: 'color.page', label: 'পেজের পেছনের রং', group: 'page', type: 'color', default: '#F6F8F7' },
  { key: 'color.surface', label: 'কার্ডের রং', group: 'page', type: 'color', default: '#FFFFFF' },
  { key: 'color.border', label: 'দাগ/বর্ডার', group: 'page', type: 'color', default: '#E3E8E6' },
  { key: 'color.border-soft', label: 'হালকা বর্ডার', group: 'page', type: 'color', default: '#EEF2F0' },
  { key: 'color.text', label: 'লেখার রং', group: 'page', type: 'color', default: '#3F4A46' },
  { key: 'color.text-muted', label: 'হালকা লেখার রং', group: 'page', type: 'color', default: '#5E6A66' },
  { key: 'color.heading', label: 'শিরোনামের রং', group: 'page', type: 'color', default: '#10261E' },

  // topbar
  { key: 'color.topbar-bg', label: 'টপ বারের রং', group: 'topbar', type: 'color', default: '#006A4E' },
  { key: 'color.topbar-text', label: 'টপ বারের লেখা', group: 'topbar', type: 'color', default: '#E3F1EC' },
  { key: 'color.topbar-cta-bg', label: '“লেখক হোন” বোতামের রং', group: 'topbar', type: 'color', default: '#F42A41' },
  { key: 'color.topbar-cta-text', label: '“লেখক হোন” বোতামের লেখা', group: 'topbar', type: 'color', default: '#FFFFFF' },

  // header
  { key: 'color.header-bg', label: 'হেডারের রং', group: 'header', type: 'color', default: '#FFFFFF' },
  { key: 'color.header-border', label: 'হেডারের নিচের দাগ', group: 'header', type: 'color', default: '#E3E8E6' },
  { key: 'color.logo-text', label: 'লোগোর নাম', group: 'header', type: 'color', default: '#10261E' },
  { key: 'color.logo-accent', label: 'লোগোর নামের দ্বিতীয় অংশ', group: 'header', type: 'color', default: '#D7263D' },
  { key: 'color.logo-mark', label: 'লোগো চিহ্নের রং', hint: 'নিজের লোগো আপলোড না করলে', group: 'header', type: 'color', default: '#006A4E' },

  // menu
  { key: 'color.menu-link', label: 'মেনুর লেখা', group: 'menu', type: 'color', default: '#10261E' },
  { key: 'color.menu-link-hover', label: 'মেনুর লেখা (মাউস রাখলে)', group: 'menu', type: 'color', default: '#D7263D' },
  { key: 'color.menu-indicator', label: 'মেনুর নিচের দাগ', group: 'menu', type: 'color', default: '#D7263D' },

  // submenu
  { key: 'color.submenu-bg', label: 'সাবমেনুর রং', group: 'submenu', type: 'color', default: '#FFFFFF' },
  { key: 'color.submenu-text', label: 'সাবমেনুর লেখা', group: 'submenu', type: 'color', default: '#10261E' },
  { key: 'color.submenu-hover-bg', label: 'সাবমেনু (মাউস রাখলে) পেছনের রং', group: 'submenu', type: 'color', default: '#FDECEE' },
  { key: 'color.submenu-hover-text', label: 'সাবমেনু (মাউস রাখলে) লেখা', group: 'submenu', type: 'color', default: '#D7263D' },
  { key: 'color.submenu-top-line', label: 'সাবমেনুর ওপরের দাগ', group: 'submenu', type: 'color', default: '#D7263D' },
  { key: 'color.submenu-heading', label: 'সাবমেনুর ছোট শিরোনাম', group: 'submenu', type: 'color', default: '#D7263D' },
  { key: 'color.submenu-side-bg', label: 'সাবমেনুর ডান পাশের রং', group: 'submenu', type: 'color', default: '#F6F8F7' },
  { key: 'color.mega-story-bg', label: 'গল্প মেনুর বাঁ পাশের রং', group: 'submenu', type: 'color', default: '#006A4E' },
  { key: 'color.mega-poem-bg', label: 'কবিতা মেনুর বাঁ পাশের রং', group: 'submenu', type: 'color', default: '#B51F33' },
  { key: 'color.mega-memory-bg', label: 'স্মৃতি মেনুর বাঁ পাশের রং', group: 'submenu', type: 'color', default: '#7C4E0E' },
  { key: 'color.mega-neutral-bg', label: 'অন্য মেনুর বাঁ পাশের রং', group: 'submenu', type: 'color', default: '#10261E' },

  // button
  { key: 'color.button-bg', label: 'বোতামের রং', group: 'button', type: 'color', default: '#006A4E' },
  { key: 'color.button-text', label: 'বোতামের লেখা', group: 'button', type: 'color', default: '#FFFFFF' },
  { key: 'color.button-hover-bg', label: 'বোতামের রং (মাউস রাখলে)', group: 'button', type: 'color', default: '#D7263D' },

  // panel
  { key: 'color.dark-bg', label: 'গাঢ় ব্লকের রং', group: 'panel', type: 'color', default: '#10261E' },
  { key: 'color.dark-text', label: 'গাঢ় ব্লকের লেখা', group: 'panel', type: 'color', default: '#D5E4DE' },
  { key: 'color.band-bg', label: 'কবিতার ব্যান্ডের রং', group: 'panel', type: 'color', default: '#00563F' },

  // footer
  { key: 'color.footer-bg', label: 'ফুটারের রং', group: 'footer', type: 'color', default: '#10261E' },
  { key: 'color.footer-text', label: 'ফুটারের লেখা', group: 'footer', type: 'color', default: '#BFD2CA' },
  { key: 'color.footer-heading', label: 'ফুটারের শিরোনাম', group: 'footer', type: 'color', default: '#FFFFFF' },
  { key: 'color.footer-border', label: 'ফুটারের দাগ', group: 'footer', type: 'color', default: '#23413A' },
  { key: 'color.footer-accent', label: 'ফুটারের ওপরের দাগ', group: 'footer', type: 'color', default: '#F42A41' },

  // kinds
  { key: 'color.story', label: 'গল্প (গাঢ়)', group: 'kinds', type: 'color', default: '#006A4E' },
  { key: 'color.story-tint', label: 'গল্প (হালকা)', group: 'kinds', type: 'color', default: '#E6F2EE' },
  { key: 'color.poem', label: 'কবিতা (গাঢ়)', group: 'kinds', type: 'color', default: '#D7263D' },
  { key: 'color.poem-tint', label: 'কবিতা (হালকা)', group: 'kinds', type: 'color', default: '#FDECEE' },
  { key: 'color.memory', label: 'স্মৃতিকথা (গাঢ়)', group: 'kinds', type: 'color', default: '#9A6212' },
  { key: 'color.memory-tint', label: 'স্মৃতিকথা (হালকা)', group: 'kinds', type: 'color', default: '#FBF1DE' },

  // fonts
  { key: 'font.body', label: 'সাধারণ লেখার ফন্ট', group: 'fonts', type: 'font', default: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" },
  { key: 'font.heading', label: 'শিরোনামের ফন্ট', group: 'fonts', type: 'font', default: "'Tiro Bangla', serif" },
  { key: 'size.base', label: 'লেখার সাধারণ আকার', hint: 'যেমন 16px, 17px', group: 'fonts', type: 'size', default: '16px' },

  // shape
  { key: 'size.radius-card', label: 'কার্ডের কোণ', group: 'shape', type: 'size', default: '18px' },
  { key: 'size.radius-lg', label: 'বড় ব্লকের কোণ', group: 'shape', type: 'size', default: '24px' },
  { key: 'size.radius-button', label: 'বোতামের কোণ', hint: '999px = পুরো গোল', group: 'shape', type: 'size', default: '999px' }
];

export const cssVarName = (key: string): string => `--${key.replace(/\./g, '-')}`;

export const DEFAULT_TOKENS: Record<string, string> = Object.fromEntries(TOKENS.map((t) => [t.key, t.default]));

/** Only allow safe values (colors, font stacks, lengths) - values come from the database. */
const SAFE_VALUE = /^[#a-zA-Z0-9 ,.'%()\-_]+$/;

export function isSafeValue(value: string): boolean {
  return value.length <= 200 && SAFE_VALUE.test(value);
}

/** Builds the ":root{ --color-primary: ...; }" block for a theme. */
export function buildThemeCss(overrides: Record<string, string>): string {
  const lines: string[] = [];
  for (const token of TOKENS) {
    const raw = overrides[token.key] ?? token.default;
    const value = isSafeValue(raw) ? raw : token.default;
    lines.push(`${cssVarName(token.key)}:${value};`);
  }
  return `:root{${lines.join('')}}`;
}
