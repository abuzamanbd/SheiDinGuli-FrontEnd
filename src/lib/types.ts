/** Shapes shared by the whole frontend. They mirror what the backend API will return. */

export type PostKind = 'story' | 'poem' | 'memory' | 'essay' | 'other';

export interface PostCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  kind: PostKind;
  kindLabel: string;
  categoryName: string;
  authorName: string;
  authorUsername: string;
  publishedAt: string; // ISO
  readMinutes: number;
  views: number;
  likes: number;
  /** First lines of a poem, shown on poem cards. */
  poemLines?: string;
  coverUrl?: string;
}

export interface PostFullData extends PostCardData {
  subtitle?: string;
  bodyHtml: string;
  tags: string[];
  breadcrumbs: { label: string; href?: string }[];
  /** Article theme the author picked (see styles/themes/article). */
  articleTheme: ArticleThemeKey;
  featured?: boolean;
  prev?: { title: string; slug: string };
  next?: { title: string; slug: string };
}

export interface AuthorData {
  username: string;
  name: string;
  roleLabel: string;
  bio: string;
  longBio?: string;
  location?: string;
  favouriteKinds?: string;
  website?: string;
  joinedLabel: string;
  verified: boolean;
  topics: string[];
  counts: { total: number; story: number; poem: number; memory: number };
}

export type ArticleThemeKey = 'classic' | 'modern' | 'poetry' | 'nostalgia' | 'night';

export interface ArticleThemeInfo {
  key: ArticleThemeKey;
  name: string;
  description: string;
  bestFor: string;
}

// ---------- navigation

export interface MenuLink {
  label: string;
  href: string;
}

export interface MegaFeaturedItem {
  title: string;
  sub: string;
  href: string;
  shape: 'square' | 'round';
  kind: PostKind;
}

export interface MenuNode {
  id: string;
  label: string;
  href: string;
  type: 'link' | 'mega' | 'dropdown';
  isActive?: boolean;
  /** type 'dropdown' */
  links?: MenuLink[];
  /** type 'mega' */
  mega?: {
    tone: 'story' | 'poem' | 'memory' | 'neutral';
    title: string;
    description: string;
    ctaLabel: string;
    columns: { heading: string; links: MenuLink[] }[];
    featured: { heading: string; items: MegaFeaturedItem[] };
  };
}

export interface SiteSettings {
  siteNameFirst: string;
  siteNameAccent: string;
  tagline: string;
  /** Uploaded logo (admin). When empty the built-in mark is drawn with CSS. */
  logoUrl?: string;
  logoAlt: string;
  homeLayout: HomeLayoutKey;
  topBarEnabled: boolean;
  topBarLinks: MenuLink[];
  footerAbout: string;
  footerGroups: { heading: string; links: MenuLink[] }[];
  copyright: string;
  footerNote: string;
  defaultThemeId: string;
}

export type HomeLayoutKey = 'magazine' | 'classic';

// ---------- sections (admin-controlled blocks)

export type SectionSource =
  | { mode: 'latest' }
  | { mode: 'top'; metric: 'views' | 'likes'; period: 'day' | 'week' | 'month' | 'all' }
  | { mode: 'category'; categorySlug: string }
  | { mode: 'postType'; typeKey: PostKind }
  | { mode: 'manual'; postIds: string[] };

export interface SectionConfig {
  /** Unique id, e.g. "home.stories". Rendered as data-section on the block. */
  key: string;
  enabled: boolean;
  title?: string;
  subtitle?: string;
  linkLabel?: string;
  linkHref?: string;
  source?: SectionSource;
  count?: number;
  /** Free text used by static blocks (call-to-action etc.). */
  body?: string;
  buttonLabel?: string;
}

export interface HomeConfig {
  layout: HomeLayoutKey;
  sections: SectionConfig[];
}

// ---------- theme

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  /** Only the tokens that differ from the default theme. */
  tokens: Record<string, string>;
  /** Show automatically on these days every year (MM-DD). */
  recurring?: { from: string; to: string };
  /** Or on a fixed date range (YYYY-MM-DD). */
  range?: { from: string; to: string };
}

export interface AdSlotData {
  key: string;
  enabled: boolean;
}
