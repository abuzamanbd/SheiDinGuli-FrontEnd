import Link from 'next/link';
import type { PostCardData } from '@/lib/types';
import { initialOf, timeAgoBn, toBn } from '@/lib/bn';
import { Stats, kindClass } from './Parts';

export function PostCard({ post, small }: { post: PostCardData; small?: boolean }) {
  return (
    <Link href={`/post/${post.slug}`} className={`c-post-card ${kindClass(post.kind)}${small ? ' c-post-card--small' : ''}`}>
      <div className="c-post-card__art">
        {post.coverUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="c-post-card__cover" src={post.coverUrl} alt="" /> : initialOf(post.title)}
      </div>
      <div className="c-post-card__body">
        <span className="c-post-card__kind">{post.kindLabel} · {post.categoryName}</span>
        <h3 className="c-post-card__title">{post.title}</h3>
        <p className="c-post-card__excerpt">{post.excerpt}</p>
        <div className="c-post-card__foot">
          <span className="c-post-card__author">{post.authorName}</span>
          <span>{toBn(post.readMinutes)} মিনিটের পাঠ · {timeAgoBn(post.publishedAt)}</span>
          <Stats views={post.views} likes={post.likes} />
        </div>
      </div>
    </Link>
  );
}

export function PostRow({ post }: { post: PostCardData }) {
  return (
    <Link href={`/post/${post.slug}`} className={`c-post-row ${kindClass(post.kind)}`}>
      <div className="c-post-row__thumb">{initialOf(post.title)}</div>
      <div className="c-post-row__body">
        <h3 className="c-post-row__title">{post.title}</h3>
        <p className="c-post-row__excerpt">{post.excerpt}</p>
        <div className="c-post-row__foot">
          <span className="c-post-row__author">{post.authorName}</span> · {post.categoryName} · {timeAgoBn(post.publishedAt)}
        </div>
      </div>
    </Link>
  );
}

export function PostLine({ post }: { post: PostCardData }) {
  return (
    <article className={`c-post-line ${kindClass(post.kind)}`}>
      <div className="c-post-line__thumb">{initialOf(post.title)}</div>
      <div className="c-post-line__body">
        <div className="c-post-line__meta">
          <span className="c-badge">{post.kindLabel}</span>
          <span>{post.categoryName}</span>·<span>{timeAgoBn(post.publishedAt)}</span>·<span>{toBn(post.readMinutes)} মিনিট</span>
        </div>
        <Link href={`/post/${post.slug}`} className="c-post-line__title">{post.title}</Link>
        <p className="c-post-line__excerpt">{post.excerpt}</p>
        <Stats views={post.views} likes={post.likes} />
      </div>
    </article>
  );
}

export function PoemCard({ post, light }: { post: PostCardData; light?: boolean }) {
  return (
    <Link href={`/post/${post.slug}`} className={`c-poem-card is-poem${light ? ' c-poem-card--light' : ''}`}>
      <span className="c-poem-card__quote">“</span>
      <h3 className="c-poem-card__title">{post.title}</h3>
      <p className="c-poem-card__lines">{post.poemLines ?? post.excerpt}</p>
      <span className="c-poem-card__author">{post.authorName}</span>
    </Link>
  );
}
