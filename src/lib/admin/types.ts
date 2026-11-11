// Shapes returned by the review API (camelCase JSON). Kept in sync with SheiDinGuli.Application.Features.Review.
export interface QueueItem {
  taskId: string; postId: string; title: string; authorName: string; postType: string; queue: string; taskStatus: string;
  submittedAtUtc: string | null; matchCount: number; words: number; isRevisionOfPublished: boolean;
}
export interface QueueCounts { pending: number; flagged: number; escalated: number; reReview: number }
export interface QueuePage { items: QueueItem[]; total: number; counts: QueueCounts }
export interface PolicyMatch { text: string; field: string; severity: string; snippet: string | null; listName: string }
export interface PreviousDecision { decision: string; reason: string | null; comment: string | null; reviewerName: string | null; at: string }
export interface ReviewItem {
  taskId: string; postId: string; queue: string; taskStatus: string; authorId: string; authorName: string; postType: string; category: string | null;
  title: string; excerpt: string | null; bodyHtml: string; tags: string[]; poemMode: boolean; isTrueStory: boolean; isTranslation: boolean; audience: string | null;
  submittedAtUtc: string | null; matches: PolicyMatch[]; history: PreviousDecision[];
}
export type QueueName = 'Pending' | 'Flagged' | 'Escalated' | 'ReReview';
