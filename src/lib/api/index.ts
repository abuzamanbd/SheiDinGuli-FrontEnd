import { mockApi } from './mock';
import {
  USE_MOCK, getAuthorFromApi, getAuthorPostsFromApi, getPostFromApi, getPostsForSourceFromApi, getRelatedFromApi
} from './http';
import type { SiteApi } from './types';

/**
 * The one place the pages get data from. Menus, settings, themes and home layout are still sample data.
 * Posts and authors come from the real API first. While NEXT_PUBLIC_USE_MOCK is not "false" the sample data
 * fills in wherever the API has nothing yet, so the design preview keeps working on an empty database.
 */
export const api: SiteApi = {
  ...mockApi,
  async getAuthor(username) {
    return (await getAuthorFromApi(username)) ?? mockApi.getAuthor(username);
  },
  async getAuthorPosts(username) {
    return (await getAuthorPostsFromApi(username)) ?? mockApi.getAuthorPosts(username);
  },
  async getPostsForSource(source, count) {
    const real = await getPostsForSourceFromApi(source, count);
    if (real && (real.length > 0 || !USE_MOCK)) return real;
    return mockApi.getPostsForSource(source, count);
  },
  async getPost(slug) {
    const real = await getPostFromApi(slug);
    if (real) return real;
    return USE_MOCK ? mockApi.getPost(slug) : null;
  },
  async getRelatedPosts(slug, count) {
    const real = await getRelatedFromApi(slug, count);
    if (real && (real.length > 0 || !USE_MOCK)) return real;
    return mockApi.getRelatedPosts(slug, count);
  }
};
export type { SiteApi } from './types';
