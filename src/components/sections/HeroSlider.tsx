'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { PostCardData } from '@/lib/types';
import { initialOf, toBn } from '@/lib/bn';
import { Icon } from '../Icon';

const AUTOPLAY_MS = 6000;

function Art() {
  return (
    <svg viewBox="0 0 300 240" fill="none" aria-hidden="true">
      <circle cx="210" cy="70" r="42" fill="currentColor" opacity=".18" />
      <path d="M0 190c40-30 80-30 120-8s90 22 180-20v78H0v-50Z" fill="currentColor" opacity=".25" />
      <path d="M20 170c50-20 90-10 130 8s90 10 130-10" stroke="currentColor" strokeWidth="3" opacity=".5" />
      <rect x="80" y="96" width="70" height="60" rx="4" fill="currentColor" opacity=".55" />
      <path d="m72 98 43-30 43 30Z" fill="currentColor" />
    </svg>
  );
}

export function HeroSlider({ posts, variant = 'card', sectionKey }: { posts: PostCardData[]; variant?: 'card' | 'banner'; sectionKey: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = posts.length;

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [i, paused, n]);

  if (!n) return null;
  const p = posts[i];
  const go = (d: number) => setI((x) => (x + d + n) % n);
  const arrows = (
    <div className="s-slider__arrows">
      <button type="button" className="c-icon-btn" onClick={() => go(-1)} aria-label="আগেরটি"><Icon name="arrowLeft" /></button>
      <button type="button" className="c-icon-btn" onClick={() => go(1)} aria-label="পরেরটি"><Icon name="arrowRight" /></button>
    </div>
  );

  if (variant === 'banner') {
    return (
      <section className={`s-slider s-slider--banner is-${p.kind}`} data-section={sectionKey} aria-roledescription="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="s-slider__art"><Art /></div>
        <div className="s-slider__banner-top">
          <span className="s-slider__badge"><Icon name="flame" width={14} height={14} />সম্পাদকের পছন্দ</span>
          <span><span className="s-slider__counter">{toBn(i + 1)} / {toBn(n)}</span></span>
        </div>
        <div className="s-slider__text">
          <span className="s-slider__chip">{p.kindLabel}</span>
          <h2 className="s-slider__title"><Link href={`/post/${p.slug}`}>{p.title}</Link></h2>
          <p className="s-slider__excerpt">{p.excerpt}</p>
          <div className="s-slider__foot">
            <span className="c-initial">{initialOf(p.authorName)}</span>
            <span className="s-slider__who"><Link href={`/author/${p.authorUsername}`}>{p.authorName}</Link><span>{toBn(p.readMinutes)} মিনিটের পাঠ</span></span>
            <Link href={`/post/${p.slug}`} className="c-btn s-slider__read">পড়ুন <Icon name="arrowRight" /></Link>
          </div>
          <div className="s-slider__dots">{posts.map((x, k) => <button key={x.id} type="button" className={`s-slider__dot${k === i ? ' is-on' : ''}`} onClick={() => setI(k)} aria-label={`${toBn(k + 1)} নম্বর`} />)}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`s-slider is-${p.kind}`} data-section={sectionKey} aria-roledescription="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="s-slider__stage">
        <div className="s-slider__bars">{posts.map((x, k) => <button key={x.id} type="button" className={`s-slider__bar${k <= i ? ' is-on' : ''}`} onClick={() => setI(k)} aria-label={`${toBn(k + 1)} নম্বর`} />)}</div>
        <div className="s-slider__art"><Art /></div>
        {arrows}
      </div>
      <div className="s-slider__body">
        <span className="s-slider__tag">সম্পাদকের পছন্দ · {p.kindLabel}</span>
        <h2 className="s-slider__title"><Link href={`/post/${p.slug}`}>{p.title}</Link></h2>
        <p className="s-slider__excerpt">{p.excerpt}</p>
        <div className="s-slider__foot">
          <span className="c-initial">{initialOf(p.authorName)}</span>
          <span className="s-slider__who"><Link href={`/author/${p.authorUsername}`}>{p.authorName}</Link><span>{toBn(p.readMinutes)} মিনিটের পাঠ</span></span>
          <Link href={`/post/${p.slug}`} className="c-btn s-slider__read">পড়ুন <Icon name="arrowRight" /></Link>
        </div>
      </div>
    </section>
  );
}
