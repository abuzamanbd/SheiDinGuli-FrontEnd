import { mockApi } from './mock';
import { getAuthorFromApi, getAuthorPostsFromApi } from './http';
import type { SiteApi } from './types';

/**
 * The one place the pages get data from. Home, posts and menus are still sample data.
 * Author pages come from the real API first (registered authors), then fall back to the sample authors
 * so the design preview keeps working.
 */
export const api: SiteApi = {
  ...mockApi,
  async getAuthor(username) {
    return (await getAuthorFromApi(username)) ?? mockApi.getAuthor(username);
  },
  async getAuthorPosts(username) {
    return (await getAuthorPostsFromApi(username)) ?? mockApi.getAuthorPosts(username);
  }
};
export type { SiteApi } from './types';
