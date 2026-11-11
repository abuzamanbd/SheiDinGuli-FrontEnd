// Shapes returned by the author API (camelCase JSON). Kept in sync with SheiDinGuli.Application.Features.Posts.
export interface PostListItem { id: string; slug: string; title: string; status: string; postType: string; views: number; likes: number; updatedAtUtc: string; publishedAtUtc: string | null }
export interface Dashboard {
  totals: { published: number; inReview: number; drafts: number; changesRequested: number; rejected: number; views: number; likes: number };
  changesRequested: { postId: string; title: string; comment: string | null; reviewerName: string | null; at: string } | null;
  inReview: { postId: string; title: string; submittedAtUtc: string | null; flagged: boolean }[];
  last7Days: { date: string; views: number }[];
  recent: PostListItem[];
}
export interface PostsPage { items: PostListItem[]; total: number }

export const STATUS_LABEL: Record<string, { label: string; tone: 'green' | 'amber' | 'red' | 'grey' }> = {
  Published: { label: 'প্রকাশিত', tone: 'green' }, PendingReview: { label: 'পর্যালোচনায়', tone: 'amber' }, Flagged: { label: 'পর্যালোচনায়', tone: 'amber' },
  ChangesRequested: { label: 'সংশোধন প্রয়োজন', tone: 'red' }, Rejected: { label: 'বাতিল', tone: 'red' }, Draft: { label: 'খসড়া', tone: 'grey' }, Unpublished: { label: 'অপ্রকাশিত', tone: 'grey' }
};
export interface EditorOptions {
  postTypes: { id: string; key: string; name: string }[];
  categories: { id: string; slug: string; name: string; postTypeKey: string | null; children: { id: string; slug: string; name: string }[] }[];
  districts: { id: string; name: string; thanas: { id: string; name: string }[] }[];
  canPublishDirect: boolean;
}
export interface PostForEditor {
  id: string; slug: string; status: string; isLocked: boolean; postTypeId: string; categoryId: string; subCategoryId: string | null;
  title: string; excerpt: string | null; bodyHtml: string; tags: string[]; audience: string | null; isTrueStory: boolean; isTranslation: boolean;
  originalityConfirmed: boolean; bodyFont: string | null; bodySize: number | null; poemMode: boolean; articleTheme: string | null;
  locationDistrictId: string | null; locationThanaId: string | null; locationVillage: string | null;
  feedback: { decision: string; reason: string | null; comment: string | null; reviewerName: string | null; at: string } | null; updatedAtUtc: string;
}
