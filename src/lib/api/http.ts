import { cache } from 'react';
import { API_BASE_URL } from '@/lib/auth/config';
import { formatDateBn } from '@/lib/bn';
import type { ArticleThemeKey, AuthorData, PostCardData, PostFullData, PostKind, SectionSource } from '@/lib/types';

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
    const res = await fetch(`${API_BASE_URL}/api/v1/${path}`, { next: { revalidate } });
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
