import type { ReactNode } from 'react';
import { api } from '@/lib/api';
import type { HomeLayoutKey, PostCardData, SectionConfig } from '@/lib/types';
import { AdSlot } from '../AdSlot';
import { PoemCard, PostCard, PostRow } from '../cards/Cards';
import { SectionHead } from './SectionHead';
import { HeroSlider } from './HeroSlider';
import { TopPosts, type Period } from './TopPosts';
import { AuthorsList, AuthorsStrip, CategoryTiles, CtaCard, LatestList, Newsletter, TopicsCard } from './Small';

const PERIODS: Period[] = ['day', 'week', 'month', 'all'];

/**
 * Builds the home page from the admin's section list. Each block is looked up by its key,
 * so the admin can switch a block off or change what it shows without touching code.
 */
export async function Home({ layout: forced }: { layout?: HomeLayoutKey }) {
  const config = await api.getHomeConfig();
  const layout = forced ?? config.layout;
  const sec = (key: string): SectionConfig | undefined => config.sections.find((s) => s.key === key && s.enabled);
  const posts = async (s?: SectionConfig, fallbackCount = 4): Promise<PostCardData[]> =>
    s?.source ? api.getPostsForSource(s.source, s.count ?? fallbackCount) : [];

  const [latest, slider, stories, poems, memories, topics, authors] = await Promise.all([
    posts(sec('home.hero.latest')), posts(sec('home.hero.slider')), posts(sec('home.stories')), posts(sec('home.poems')),
    posts(sec('home.memories')), api.getTopics(), api.getFeaturedAuthors(sec('home.authors')?.count ?? 5)
  ]);

  const topSec = sec('home.hero.top');
  const topSource = topSec?.source?.mode === 'top' ? topSec.source : undefined;
  const byPeriod = {} as Record<Period, PostCardData[]>;
  if (topSource) {
    await Promise.all(PERIODS.map(async (p) => { byPeriod[p] = await api.getPostsForSource({ ...topSource, period: p }, topSec?.count ?? 5); }));
  }

  const top = (light: boolean): ReactNode => topSec && topSource && (
    <TopPosts sectionKey={topSec.key} title={topSec.title ?? 'শীর্ষ লেখা'} byPeriod={byPeriod} defaultPeriod={topSource.period} metric={topSource.metric} linkLabel={topSec.linkLabel} linkHref={topSec.linkHref} light={light} />
  );
  const adTop = sec('home.ad.top') && <div className="l-wrap l-ad-row"><AdSlot slot="home.ad.top" shape="banner" /></div>;
  const head = (s: SectionConfig | undefined, onDark = false) => s && <SectionHead eyebrow={s.subtitle} title={s.title} linkLabel={s.linkLabel} linkHref={s.linkHref} onDark={onDark} />;

  const storiesSec = sec('home.stories');
  const poemsSec = sec('home.poems');
  const memSec = sec('home.memories');
  const ctaSec = sec('home.sidebar.cta');
  const topicsSec = sec('home.sidebar.topics');
  const authorsSec = sec('home.authors');
  const newsSec = sec('home.newsletter');

  const storiesBlock = storiesSec && (
    <section className="l-wrap s-block" data-section={storiesSec.key}>
      {head(storiesSec)}
      <div className="s-grid">{stories.map((p) => <PostCard key={p.id} post={p} />)}</div>
    </section>
  );
  const poemsBlock = poemsSec && (layout === 'magazine' ? (
    <section className="s-band" data-section={poemsSec.key}>
      <div className="l-wrap s-band__inner">
        {head(poemsSec, true)}
        <div className="s-grid s-grid--wide">{poems.map((p) => <PoemCard key={p.id} post={p} />)}</div>
      </div>
    </section>
  ) : (
    <section className="l-wrap s-block" data-section={poemsSec.key}>
      {head(poemsSec)}
      <div className="s-grid s-grid--wide">{poems.map((p) => <PoemCard key={p.id} post={p} light />)}</div>
    </section>
  ));
  const sidebar = (
    <>
      {ctaSec && <CtaCard sectionKey={ctaSec.key} title={ctaSec.title} body={ctaSec.body} buttonLabel={ctaSec.buttonLabel} />}
      {topicsSec && <TopicsCard sectionKey={topicsSec.key} title={topicsSec.title} topics={topics} />}
      {authorsSec && layout === 'classic' && <AuthorsList sectionKey={authorsSec.key} title={authorsSec.title} authors={authors} />}
      {sec('home.sidebar.ad') && <AdSlot slot="home.sidebar.ad" shape="box" />}
      {newsSec && layout === 'classic' && <Newsletter card sectionKey={newsSec.key} title={newsSec.title} body={newsSec.body} />}
    </>
  );
  const memoriesBlock = memSec && (
    <section className="s-block" data-section={memSec.key}>
      {head(memSec)}
      <div className="s-grid s-grid--wide">{memories.map((p) => <PostRow key={p.id} post={p} />)}</div>
    </section>
  );

  if (layout === 'classic') {
    return (
      <div className="p-home" data-layout="classic">
        {adTop}
        <div className="l-wrap s-hero">
          {sec('home.hero.slider') && <HeroSlider variant="banner" posts={slider} sectionKey="home.hero.slider" />}
          {top(true)}
        </div>
        {sec('home.categories') && <CategoryTiles sectionKey="home.categories" />}
        {storiesBlock}
        {poemsBlock}
        <div className="l-wrap s-block">
          <div className="l-with-sidebar">
            <div className="l-with-sidebar__main">{memoriesBlock}</div>
            <aside className="l-with-sidebar__side">{sidebar}</aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-home" data-layout="magazine">
      {adTop}
      <div className="l-wrap s-hero">
        {sec('home.hero.latest') && <LatestList sectionKey="home.hero.latest" title={sec('home.hero.latest')?.title ?? 'সর্বশেষ'} posts={latest} />}
        {sec('home.hero.slider') && <HeroSlider posts={slider} sectionKey="home.hero.slider" />}
        {top(false)}
      </div>
      {storiesBlock}
      {poemsBlock}
      <div className="l-wrap s-block">
        <div className="l-with-sidebar">
          <div className="l-with-sidebar__main">{memoriesBlock}</div>
          <aside className="l-with-sidebar__side">{sidebar}</aside>
        </div>
      </div>
      {authorsSec && (
        <section className="l-wrap s-block" data-section={authorsSec.key}>
          {head(authorsSec)}
          <AuthorsStrip sectionKey={`${authorsSec.key}.strip`} authors={authors} />
        </section>
      )}
      {newsSec && <div className="s-block"><Newsletter sectionKey={newsSec.key} title={newsSec.title} body={newsSec.body} /></div>}
    </div>
  );
}
