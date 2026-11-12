import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryFromApi, getPostsForSourceFromApi } from '@/lib/api/http';
import { PostCard } from '@/components/cards/Cards';
import { AdSlot } from '@/components/AdSlot';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getCategoryFromApi(decodeURIComponent(slug));
  return { title: cat ? `${cat.name} — গল্পকথা` : 'বিভাগ — গল্পকথা' };
}

/** Everything published under one category (or one of its subcategories). */
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  let slug = raw;
  try { slug = decodeURIComponent(raw); } catch { /* keep */ }

  const cat = await getCategoryFromApi(slug);
  if (!cat) notFound();
  const posts = (await getPostsForSourceFromApi({ mode: 'category', categorySlug: cat.slug }, 30)) ?? [];

  return (
    <div className="p-category" data-section="category.page">
      <div className="l-wrap l-ad-row"><AdSlot slot="category.top" shape="banner" /></div>
      <div className="l-wrap">
        <header className="p-category__head">
          {cat.parentName && cat.parentSlug && <Link href={`/category/${cat.parentSlug}`} className="p-category__crumb">← {cat.parentName}</Link>}
          <h1 className="p-category__title">{cat.name}</h1>
          {cat.description && <p className="p-category__desc">{cat.description}</p>}
          {cat.children.length > 0 && (
            <div className="p-category__chips">{cat.children.map((c) => <Link key={c.id} href={`/category/${c.slug}`} className="c-chip">{c.name}</Link>)}</div>
          )}
        </header>
        {posts.length === 0
          ? <p className="p-category__empty">এই বিভাগে এখনো কোনো লেখা নেই।</p>
          : <div className="s-grid">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>}
      </div>
    </div>
  );
}
