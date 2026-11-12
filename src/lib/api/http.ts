import { cache } from 'react';
import { API_BASE_URL } from '@/lib/auth/config';
import { formatDateBn } from '@/lib/bn';
import type { ArticleThemeKey, AuthorData, MenuLink, MenuNode, PostCardData, PostFullData, PostKind, SectionSource } from '@/lib/types';

/** Shapes of GET /api/v1/authors/{username}. */
interface ApiAuthor {
  username: string; name: string; roleLabel: string; verified: boolean; bio: string | null; location: string | null;
  joinedAtUtc: string; topics: string[]; counts: { total: number; story: number; poem: number; memory: number };
}
interface ApiPost {
  id: string; slug: string; title: string; excerpt: string; kind: string; kindLabel: string; categoryName: string;
  authorName: string; authorUsername: string; publishedAt: string; readMinutes: number; views: number; likes: number;
}
interface ApiAuthorPage { author: ApiAuthor; posts: ApiPost[] }

const KINDS: PostKind[] = ['story', 'poem', 'memory', 'essay', 'other'];

/** One request per render, shared by getAuthor and getAuthorPosts. Null when the API says 404 or is unreachable. */
const fetchAuthorPage = cache(async (username: string): Promise<ApiAuthorPage | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/authors/${encodeURIComponent(username)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as ApiAuthorPage;
  } catch {
    return null;
  }
});

export async function getAuthorFromApi(username: string): Promise<AuthorData | null> {
  const page = await fetchAuthorPage(username);
  if (!page) return null;
  const a = page.author;
  return {
    username: a.username, name: a.name, roleLabel: a.roleLabel, bio: a.bio ?? '', location: a.location ?? undefined,
    joinedLabel: `যোগ দিয়েছেন ${formatDateBn(a.joinedAtUtc)}`, verified: a.verified, topics: a.topics, counts: a.counts
  };
}

export async function getAuthorPostsFromApi(username: string): Promise<PostCardData[] | null> {
  const page = await fetchAuthorPage(username);
  if (!page) return null;
  return page.posts.map((p) => ({
    id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt,
    kind: (KINDS as string[]).includes(p.kind) ? (p.kind as PostKind) : 'other', kindLabel: p.kindLabel, categoryName: p.categoryName,
    authorName: p.authorName, authorUsername: p.authorUsername, publishedAt: p.publishedAt, readMinutes: p.readMinutes, views: p.views, likes: p.likes
  }));
}

// ---------- public posts

interface ApiCard extends ApiPost { poemLines: string | null }
interface ApiPostFull { card: ApiCard; subtitle: string | null; bodyHtml: string; tags: string[]; categorySlug: string; articleTheme: string | null; poemMode: boolean; commentsEnabled: boolean }

const THEMES: ArticleThemeKey[] = ['classic', 'modern', 'poetry', 'nostalgia', 'night'];
const THEME_FOR_KIND: Record<PostKind, ArticleThemeKey> = { story: 'classic', poem: 'poetry', memory: 'nostalgia', essay: 'modern', other: 'modern' };

/** true while the sample data is allowed to fill in where the API has nothing (the default for the design preview). */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

function toCard(p: ApiCard): PostCardData {
  return {
    id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt,
    kind: (KINDS as string[]).includes(p.kind) ? (p.kind as PostKind) : 'other', kindLabel: p.kindLabel, categoryName: p.categoryName,
    authorName: p.authorName, authorUsername: p.authorUsername, publishedAt: p.publishedAt, readMinutes: p.readMinutes,
    views: p.views, likes: p.likes, poemLines: p.poemLines ?? undefined
  };
}

async function getJson<T>(path: string, revalidate = 30): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/${path}`, revalidate === 0 ? { cache: 'no-store' } : { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Cards for a home section. Null when the API cannot be reached. */
export async function getPostsForSourceFromApi(source: SectionSource, count: number): Promise<PostCardData[] | null> {
  const q = new URLSearchParams({ take: String(count) });
  switch (source.mode) {
    case 'top': q.set('sort', 'top'); q.set('metric', source.metric); q.set('period', source.period === 'day' ? 'week' : source.period); break;
    case 'category': q.set('category', source.categorySlug); break;
    case 'postType': q.set('type', source.typeKey); break;
    case 'manual': q.set('sort', 'manual'); q.set('ids', source.postIds.join(',')); break;
    default: break;
  }
  const list = await getJson<ApiCard[]>(`public/posts?${q}`);
  return list ? list.map(toCard) : null;
}

export const getPostFromApi = cache(async (slug: string): Promise<PostFullData | null> => {
  const p = await getJson<ApiPostFull>(`public/posts/${encodeURIComponent(slug)}`);
  if (!p) return null;
  const card = toCard(p.card);
  return {
    ...card,
    subtitle: p.subtitle ?? undefined,
    bodyHtml: p.bodyHtml,
    tags: p.tags,
    breadcrumbs: [{ label: 'হোম', href: '/' }, { label: card.kindLabel }, { label: card.categoryName }],
    articleTheme: (THEMES as string[]).includes(p.articleTheme ?? '') ? (p.articleTheme as ArticleThemeKey) : THEME_FOR_KIND[card.kind],
    commentsEnabled: p.commentsEnabled
  };
});

export async function getRelatedFromApi(slug: string, count: number): Promise<PostCardData[] | null> {
  const list = await getJson<ApiCard[]>(`public/posts/${encodeURIComponent(slug)}/related?take=${count}`);
  return list ? list.map(toCard) : null;
}

// ---------- menu, theme, categories

interface ApiMenuItem {
  id: string | null; label: string; type: 'category' | 'page' | 'post' | 'custom' | 'heading'; href: string | null; kind: string | null;
  categorySlug: string | null; isActive: boolean; isMega: boolean; children: ApiMenuItem[];
}

const kindOf = (k: string | null): PostKind => ((KINDS as string[]).includes(k ?? '') ? (k as PostKind) : 'other');

/** Turns the admin-made tree into the shapes the header draws. Null when the API cannot be reached or has no menu items. */
export async function getMenuFromApi(): Promise<MenuNode[] | null> {
  const tree = await getJson<ApiMenuItem[]>('public/menu/header_main', 0);
  if (!tree || tree.length === 0) return null;

  const linkOf = (i: ApiMenuItem): MenuLink | null => (i.href ? { label: i.label, href: i.href } : null);
  const linksOf = (items: ApiMenuItem[]): MenuLink[] =>
    items.flatMap((i) => (i.type === 'heading' ? linksOf(i.children) : [linkOf(i)])).filter((l): l is MenuLink => l !== null);

  return Promise.all(tree.map(async (item, n): Promise<MenuNode> => {
    const id = item.id ?? `m${n}`;
    const href = item.href ?? '#';
    if (item.children.length === 0) return { id, label: item.label, href, type: 'link' };

    if (!item.isMega) return { id, label: item.label, href, type: 'dropdown', links: linksOf(item.children) };

    const columns: { heading: string; links: MenuLink[] }[] = [];
    const loose: MenuLink[] = [];
    for (const c of item.children) {
      if (c.type === 'heading') {
        const links = linksOf(c.children);
        if (links.length > 0) columns.push({ heading: c.label, links });
      } else {
        const l = linkOf(c);
        if (l) loose.push(l);
      }
    }
    if (loose.length > 0) columns.unshift({ heading: item.label, links: loose });

    const latest = item.categorySlug ? await getPostsForSourceFromApi({ mode: 'category', categorySlug: item.categorySlug }, 3) : null;
    return {
      id, label: item.label, href, type: 'mega',
      mega: {
        tone: item.kind === 'story' || item.kind === 'poem' || item.kind === 'memory' ? item.kind : 'neutral',
        title: item.label,
        description: `“${item.label}” বিভাগের সব লেখা এক জায়গায়।`,
        ctaLabel: 'সব দেখুন',
        columns,
        featured: {
          heading: 'নতুন লেখা',
          items: (latest ?? []).map((p) => ({ title: p.title, sub: p.authorName, href: `/post/${p.slug}`, shape: 'square' as const, kind: p.kind }))
        }
      }
    };
  }));
}

/** Colour / font / size overrides the admin saved. Empty when there are none or the API is down. */
export async function getThemeOverridesFromApi(): Promise<Record<string, string>> {
  const t = await getJson<{ tokens: Record<string, string> }>('public/theme', 0);
  return t?.tokens ?? {};
}

export interface ApiCategory { slug: string; name: string; description: string | null; kind: string; children: { id: string; name: string; slug: string }[]; parentName: string | null; parentSlug: string | null }

export const getCategoryFromApi = cache(async (slug: string): Promise<ApiCategory | null> =>
  getJson<ApiCategory>(`public/categories/${encodeURIComponent(slug)}`, 30));
