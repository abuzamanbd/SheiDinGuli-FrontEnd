export interface NotificationItem { id: string; type: string; title: string; body: string | null; linkUrl: string | null; isRead: boolean; createdAtUtc: string }
export interface NotificationPage { items: NotificationItem[]; total: number; unread: number; page: number; pageSize: number }

/** Small coloured tag per notification type. */
export const NOTIFICATION_TONE: Record<string, { label: string; tone: 'green' | 'red' | 'amber' | 'grey' }> = {
  post_published: { label: 'প্রকাশিত', tone: 'green' },
  changes_requested: { label: 'সংশোধন', tone: 'amber' },
  post_rejected: { label: 'বাতিল', tone: 'red' }
};
