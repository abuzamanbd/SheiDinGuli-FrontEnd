'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import type { AuthorData, PostCardData } from '@/lib/types';
import { initialOf, timeAgoBn } from '@/lib/bn';
import { Icon, type IconName } from '../Icon';
import { useAuthModal } from '../auth/AuthModal';
import { Avatar } from '../cards/Parts';

export function LatestList({ title, posts, sectionKey }: { title: string; posts: PostCardData[]; sectionKey: string }) {
  return (
    <section className="s-latest" data-section={sectionKey}>
      <h2 className="s-latest__title"><span className="s-latest__dot" />{title}</h2>
      {posts.map((p) => (
        <Link key={p.id} href={`/post/${p.slug}`} className={`s-latest__item is-${p.kind}`}>
          <span className="s-latest__meta"><b>{p.kindLabel}</b> · {timeAgoBn(p.publishedAt)}</span>
          <span className="s-latest__name">{p.title}</span>
        </Link>
      ))}
    </section>
  );
}

export function CategoryTiles({ sectionKey }: { sectionKey: string }) {
  const tiles: { kind: string; icon: IconName; name: string; desc: string; href: string }[] = [
    { kind: 'story', icon: 'book', name: 'গল্প', desc: 'ছোটগল্প, রহস্য, প্রেম', href: '/category/golpo' },
    { kind: 'poem', icon: 'feather', name: 'কবিতা', desc: 'ছড়া, মুক্তছন্দ, গান', href: '/category/kobita' },
    { kind: 'memory', icon: 'camera', name: 'শৈশবের স্মৃতি', desc: 'গ্রাম, স্কুল, উৎসব', href: '/category/smriti' }
  ];
  return (
    <section className="l-wrap s-categories" data-section={sectionKey}>
      {tiles.map((t) => (
        <Link key={t.name} href={t.href} className={`s-categories__tile is-${t.kind}`}>
          <span className="s-categories__icon"><Icon name={t.icon} /></span>
          <span className="s-categories__text"><span className="s-categories__name">{t.name}</span><span className="s-categories__desc">{t.desc}</span></span>
          <span className="s-categories__arrow">→</span>
        </Link>
      ))}
    </section>
  );
}

export function CtaCard({ title, body, buttonLabel, sectionKey }: { title?: string; body?: string; buttonLabel?: string; sectionKey: string }) {
  const auth = useAuthModal();
  return (
    <section className="s-cta" data-section={sectionKey}>
      <div className="s-cta__inner">
        <h2 className="s-cta__title">{title}</h2>
        <p className="s-cta__text">{body}</p>
        <button type="button" className="c-btn c-btn--white s-cta__btn" onClick={() => auth.open('register')}>{buttonLabel}</button>
      </div>
    </section>
  );
}

export function TopicsCard({ title, topics, sectionKey }: { title?: string; topics: string[]; sectionKey: string }) {
  return (
    <section className="s-box" data-section={sectionKey}>
      <h2 className="s-box__title">{title}</h2>
      <div className="s-tags">{topics.map((t) => <Link key={t} href={`/topic/${encodeURIComponent(t)}`} className="c-chip">{t}</Link>)}</div>
    </section>
  );
}

export function AuthorsStrip({ authors, sectionKey }: { authors: AuthorData[]; sectionKey: string }) {
  return (
    <div className="s-authors__strip" data-section={sectionKey}>
      {authors.map((a) => (
        <Link key={a.username} href={`/author/${a.username}`} className="s-authors__card is-story">
          <Avatar name={a.name} size="md" />
          <span className="s-authors__name">{a.name}</span>
          <span className="s-authors__role">{a.roleLabel}</span>
        </Link>
      ))}
    </div>
  );
}

export function AuthorsList({ title, authors, sectionKey }: { title?: string; authors: AuthorData[]; sectionKey: string }) {
  return (
    <section className="s-box s-authors" data-section={sectionKey}>
      <h2 className="s-box__title">{title}</h2>
      {authors.map((a) => (
        <div key={a.username} className="s-authors__row is-story">
          <span className="c-initial">{initialOf(a.name)}</span>
          <span className="s-authors__who"><span className="s-authors__name">{a.name}</span><span className="s-authors__role">{a.roleLabel}</span></span>
          <Link href={`/author/${a.username}`} className="s-authors__go">দেখুন</Link>
        </div>
      ))}
    </section>
  );
}

export function Newsletter({ title, body, card, sectionKey }: { title?: string; body?: string; card?: boolean; sectionKey: string }) {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = String(new FormData(e.currentTarget).get('email') ?? '').trim();
    if (!/^\S+@\S+\.\S+$/.test(v)) { setErr('সঠিক ইমেইল ঠিকানা লিখুন'); return; }
    setErr(''); setDone(true);
  }
  const form = done ? <p className="s-newsletter__done" role="status">ধন্যবাদ! (নমুনা — এখনো সার্ভারে সংরক্ষিত হয়নি)</p> : (
    <form className="s-newsletter__form" onSubmit={submit} noValidate>
      <input className="s-newsletter__input" name="email" type="email" placeholder="আপনার ইমেইল" aria-label="ইমেইল" aria-invalid={err ? 'true' : undefined} />
      <button className="c-btn" type="submit">সাবস্ক্রাইব</button>
      {err && <span className="c-field__error">{err}</span>}
    </form>
  );
  if (card) {
    return (
      <section className="s-newsletter s-newsletter--card" data-section={sectionKey}>
        <span className="s-newsletter__icon"><Icon name="mail" /></span>
        <h2>{title}</h2><p>{body}</p>{form}
      </section>
    );
  }
  return (
    <section className="l-wrap s-newsletter" data-section={sectionKey}>
      <div className="s-newsletter__band">
        <div className="s-newsletter__text"><h2>{title}</h2><p>{body}</p></div>
        {form}
      </div>
    </section>
  );
}
