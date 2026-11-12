import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDateBn, toBn } from '@/lib/bn';
import { AdSlot } from '@/components/AdSlot';
import { Avatar, Stats } from '@/components/cards/Parts';
import { PostCard } from '@/components/cards/Cards';
import { SectionHead } from '@/components/sections/SectionHead';
import { ArticleReader } from '@/components/article/ArticleReader';
import { Comments } from '@/components/social/Comments';
import { ViewTracker } from '@/components/social/ViewTracker';
import { AuthorBox, PrevNext, ReportLink } from '@/components/article/ArticleExtras';

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await api.getPost(slug);
  if (!post) notFound();
  const [author, related] = await Promise.all([api.getAuthor(post.authorUsername), api.getRelatedPosts(slug, 3)]);

  // Body arrives as clean HTML (the backend sanitises it). The in-article ad goes after the 3rd paragraph.
  const parts = post.bodyHtml.split(/(?<=<\/p>)/).filter(Boolean);

  return (
    <article className={`p-article is-${post.kind}`} data-section="post.article">
      <ViewTracker slug={post.slug} />
      <div className="p-article__progress"><span /></div>
      <div className="l-wrap l-wrap--read">
        <nav className="p-article__crumbs" aria-label="পথ">
          {post.breadcrumbs.map((b, i) => (
            <span key={b.label}>{b.href ? <Link href={b.href}>{b.label}</Link> : b.label}{i < post.breadcrumbs.length - 1 && ' ›'}</span>
          ))}
        </nav>
        <div className="p-article__labels"><span className="c-badge c-badge--solid">{post.kindLabel}</span><span className="c-badge">{post.categoryName}</span></div>
        <h1 className="p-article__title">{post.title}</h1>
        {post.subtitle && <p className="p-article__subtitle">{post.subtitle}</p>}
        <div className="p-article__byline">
          <Avatar name={post.authorName} />
          <div className="p-article__who">
            <Link href={`/author/${post.authorUsername}`}>{post.authorName}</Link>
            <span>{formatDateBn(post.publishedAt)} · {toBn(post.readMinutes)} মিনিটের পাঠ</span>
          </div>
          <Stats views={post.views} likes={post.likes} />
        </div>
      </div>

      <div className="l-wrap l-wrap--read l-ad-row"><AdSlot slot="post.top" shape="banner" /></div>

      <div className="l-wrap l-wrap--read">
        <ArticleReader theme={post.articleTheme} parts={parts} likes={post.likes} postId={post.id} adSlot={<AdSlot slot="post.inarticle" shape="inline" />} />
        <div className="p-article__tags">
          <div>{post.tags.map((t) => <Link key={t} href={`/topic/${encodeURIComponent(t)}`} className="c-chip">{t}</Link>)}</div>
          <ReportLink />
        </div>
        <AuthorBox post={post} author={author} />
        <PrevNext post={post} />
        <Comments postId={post.id} enabled={post.commentsEnabled !== false} />
        <div className="l-ad-row"><AdSlot slot="post.bottom" shape="banner" /></div>
      </div>

      <section className="p-article__related" data-section="post.related">
        <div className="l-wrap">
          <SectionHead title="আরও পড়ুন" />
          <div className="s-grid">{related.map((p) => <PostCard key={p.id} post={p} small />)}</div>
        </div>
      </section>
    </article>
  );
}
