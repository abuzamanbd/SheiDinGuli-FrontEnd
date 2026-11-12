export interface NotificationItem { id: string; type: string; title: string; body: string | null; linkUrl: string | null; isRead: boolean; createdAtUtc: string }
export interface NotificationPage { items: NotificationItem[]; total: number; unread: number; page: number; pageSize: number }

/** Small coloured tag per notification type. */
export const NOTIFICATION_TONE: Record<string, { label: string; tone: 'green' | 'red' | 'amber' | 'grey' }> = {
  post_published: { label: 'প্রকাশিত', tone: 'green' },
  changes_requested: { label: 'সংশোধন', tone: 'amber' },
  post_rejected: { label: 'বাতিল', tone: 'red' },
  new_follower: { label: 'অনুসারী', tone: 'green' },
  new_comment: { label: 'মন্তব্য', tone: 'green' },
  comment_reply: { label: 'উত্তর', tone: 'green' },
  comment_removed: { label: 'সরানো', tone: 'red' },
  post_hidden: { label: 'সরানো', tone: 'red' },
  post_restored: { label: 'ফিরেছে', tone: 'green' }
};
