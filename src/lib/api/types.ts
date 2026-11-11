import type { AuthorData, HomeConfig, MenuNode, PostCardData, PostFullData, SectionSource, SiteSettings, ThemePreset } from '@/lib/types';

/**
 * Everything the pages need from the backend. Today it is served by sample data (api/mock.ts);
 * when the backend endpoints exist, api/http.ts implements the same interface and nothing else changes.
 */
export interface SiteApi {
  getSettings(): Promise<SiteSettings>;
  getThemes(): Promise<ThemePreset[]>;
  getMenu(): Promise<MenuNode[]>;
  getHomeConfig(): Promise<HomeConfig>;
  /** Posts for a section, according to the admin's choice (latest / top / category / manual picks...). */
  getPostsForSource(source: SectionSource, count: number): Promise<PostCardData[]>;
  getPost(slug: string): Promise<PostFullData | null>;
  getRelatedPosts(slug: string, count: number): Promise<PostCardData[]>;
  getAuthor(username: string): Promise<AuthorData | null>;
  getAuthorPosts(username: string): Promise<PostCardData[]>;
  getTopics(): Promise<string[]>;
  getFeaturedAuthors(count: number): Promise<AuthorData[]>;
}
