export interface SocialState { liked: boolean; likes: number; following: boolean; isSelf: boolean; followers: number }
export interface CommentItem {
  id: string; parentId: string | null; authorName: string; authorUsername: string; body: string;
  createdAtUtc: string; status: 'visible' | 'held'; isMine: boolean;
}
export interface HeldComment { id: string; postTitle: string; postSlug: string; authorName: string; authorUsername: string; body: string; note: string | null; createdAtUtc: string }

const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
/** Posts that exist in the database have GUID ids. The sample posts (ids like "1") do not, and cannot be liked or commented on. */
export const isRealId = (id: string) => GUID.test(id);
