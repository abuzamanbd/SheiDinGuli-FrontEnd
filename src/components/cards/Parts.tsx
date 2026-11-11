import Link from 'next/link';
import type { AuthorData, PostCardData } from '@/lib/types';
import { formatCount, formatCountShort, initialOf, timeAgoBn, toBn } from '@/lib/bn';
import { Icon } from '../Icon';

export const kindClass = (kind: string) => `is-${kind}`;

export function Avatar({ name, size }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span className={`c-avatar${size ? ` c-avatar--${size}` : ''}`}>
      <span className="c-avatar__inner">{initialOf(name)}</span>
    </span>
  );
}

export function Stats({ views, likes }: { views: number; likes: number }) {
  return (
    <span className="c-stats">
      <span className="c-stats__item"><Icon name="eye" />{formatCountShort(views)}</span>
      <span className="c-stats__item"><Icon name="heart" />{formatCountShort(likes)}</span>
    </span>
  );
}

export const authorLink = (p: Pick<PostCardData, 'authorName' | 'authorUsername'>) => (
  <Link href={`/author/${p.authorUsername}`} className="c-post-card__author">{p.authorName}</Link>
);

export { formatCount, timeAgoBn, toBn };
export type { AuthorData };
