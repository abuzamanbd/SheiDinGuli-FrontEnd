import { cache } from 'react';
import { API_BASE_URL } from '@/lib/auth/config';
import { formatDateBn } from '@/lib/bn';
import type { AuthorData, PostCardData, PostKind } from '@/lib/types';

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
