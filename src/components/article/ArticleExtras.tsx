import Link from 'next/link';
import type { AuthorData, PostFullData } from '@/lib/types';
import { Avatar } from '../cards/Parts';
import { Icon } from '../Icon';

export function AuthorBox({ post, author }: { post: PostFullData; author: AuthorData | null }) {
  return (
    <aside className={`p-article__authorbox is-${post.kind}`} data-section="post.authorbox">
      <Avatar name={post.authorName} size="md" />
      <div className="p-article__authorbox-text">
        <small>লেখক</small>
        <strong>{post.authorName}</strong>
        <p>{author?.bio}</p>
      </div>
      <Link href={`/author/${post.authorUsername}`} className="c-btn">প্রোফাইল দেখুন</Link>
    </aside>
  );
}

export function PrevNext({ post }: { post: PostFullData }) {
  return (
    <nav className="p-article__pn" aria-label="আগের ও পরের লেখা" data-section="post.prevnext">
      {post.prev && <Link href={`/post/${post.prev.slug}`} className="p-article__pn-card"><small>← আগের লেখা</small><strong>{post.prev.title}</strong></Link>}
      {post.next && <Link href={`/post/${post.next.slug}`} className="p-article__pn-card p-article__pn-card--next"><small>পরের লেখা →</small><strong>{post.next.title}</strong></Link>}
    </nav>
  );
}

export function ReportLink() {
  return <a href="#" className="p-article__report"><Icon name="flag" />অনুপযুক্ত মনে হলে জানান</a>;
}
