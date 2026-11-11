import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { toBn } from '@/lib/bn';
import { AdSlot } from '@/components/AdSlot';
import { Avatar } from '@/components/cards/Parts';
import { Icon } from '@/components/Icon';
import { AuthorTabs } from '@/components/article/AuthorTabs';

export default async function AuthorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const author = await api.getAuthor(username);
  if (!author) notFound();
  const posts = await api.getAuthorPosts(username);
  return (
    <div className="p-author is-story" data-section="author.page">
      <div className="l-wrap l-ad-row"><AdSlot slot="author.top" shape="banner" /></div>
      <div className="p-author__cover" data-section="author.cover" />
      <div className="l-wrap p-author__main">
        <section className="p-author__head" data-section="author.head">
          <Avatar name={author.name} size="lg" />
          <div className="p-author__info">
            <div className="p-author__name-row">
              <h1 className="p-author__name">{author.name}</h1>
              {author.verified && <span className="c-badge c-badge--verified">✓ যাচাইকৃত</span>}
              <span className="c-badge c-badge--accent">{author.roleLabel}</span>
            </div>
            <span className="p-author__handle">@{author.username}</span>
            <p className="p-author__bio">{author.bio}</p>
          </div>
          <div className="p-author__actions"><button type="button" className="c-btn">অনুসরণ করুন</button></div>
          <div className="p-author__counts">
            <span><b>{toBn(author.counts.total)}</b> লেখা</span>
            <span><b>{toBn(author.counts.story)}</b> গল্প</span>
            <span><b>{toBn(author.counts.poem)}</b> কবিতা</span>
            <span><b>{toBn(author.counts.memory)}</b> স্মৃতি</span>
            <span className="p-author__counts-joined"><Icon name="calendar" />{author.joinedLabel}</span>
          </div>
        </section>
        <div className="p-author__body">
          <aside className="p-author__side" data-section="author.side">
            <section className="s-box">
              <h2 className="s-box__title">পরিচিতি</h2>
              <p className="p-author__about">{author.longBio ?? author.bio}</p>
              <ul className="p-author__facts">
                {author.location && <li><Icon name="pin" />{author.location}</li>}
                {author.favouriteKinds && <li><Icon name="book" />{author.favouriteKinds}</li>}
              </ul>
            </section>
            <section className="s-box"><h2 className="s-box__title">প্রিয় বিষয়</h2><div className="s-tags">{author.topics.map((t) => <span key={t} className="c-chip">{t}</span>)}</div></section>
            <AdSlot slot="author.side" shape="box" />
          </aside>
          <AuthorTabs posts={posts} />
        </div>
      </div>
    </div>
  );
}
