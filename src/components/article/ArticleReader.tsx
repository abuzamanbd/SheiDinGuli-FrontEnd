'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { ArticleThemeKey } from '@/lib/types';
import { Icon } from '../Icon';
import { toBn, formatCountShort } from '@/lib/bn';
import { bff } from '@/lib/bff';
import { isRealId, type SocialState } from '@/lib/social';
import { useAuthModal } from '../auth/AuthModal';

const MIN = 16, MAX = 26;

/** Reading progress bar + font size control + like/bookmark, plus the themed article body. */
export function ArticleReader({ theme, parts, adSlot, likes, postId, adAfter = 3 }: {
  theme: ArticleThemeKey; parts: string[]; adSlot?: ReactNode; likes: number; postId?: string; adAfter?: number;
}) {
  const { user, open } = useAuthModal();
  const real = !!postId && isRealId(postId);
  const [count, setCount] = useState(likes);
  const [size, setSize] = useState(19);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Real posts: whether this reader already liked it, and the live count.
  useEffect(() => {
    if (!real) return;
    let alive = true;
    void bff<SocialState>('GET', `social/state?postId=${postId}`).then((r) => { if (alive && r.data) { setLiked(r.data.liked); setCount(r.data.likes); } });
    return () => { alive = false; };
  }, [real, postId, user?.id]);

  async function toggleLike() {
    if (!real) { setLiked(!liked); return; }
    if (!user) { open('login'); return; }
    const next = !liked;
    setLiked(next); setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    const r = await bff<SocialState>(next ? 'PUT' : 'DELETE', `social/posts/${postId}/like`);
    if (r.data) { setLiked(r.data.liked); setCount(r.data.likes); }
    else { setLiked(!next); setCount((c) => Math.max(0, c + (next ? -1 : 1))); }
  }

  useEffect(() => { document.documentElement.style.setProperty('--progress', `${progress}%`); }, [progress]);
  useEffect(() => () => { document.documentElement.style.removeProperty('--progress'); }, []);

  return (
    <>
      <div className="p-article__tools-bar">
        <div className="p-article__tools">
          <div className="p-article__size" role="group" aria-label="লেখার আকার">
            <button type="button" onClick={() => setSize((s) => Math.max(MIN, s - 1))} aria-label="ছোট করুন">অ−</button>
            <span />
            <button type="button" onClick={() => setSize((s) => Math.min(MAX, s + 1))} aria-label="বড় করুন">অ+</button>
          </div>
          <button type="button" className={`c-icon-btn p-article__like${liked ? ' is-active' : ''}`} aria-pressed={liked} onClick={toggleLike}>
            <Icon name="heart" />{formatCountShort(real ? count : likes + (liked ? 1 : 0))}
          </button>
          <button type="button" className={`c-icon-btn${saved ? ' is-active' : ''}`} aria-pressed={saved} aria-label="সংরক্ষণ" onClick={() => setSaved(!saved)}><Icon name="bookmark" /></button>
          <button type="button" className="c-icon-btn" aria-label="শেয়ার" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Icon name="share" /></button>
        </div>
        <span className="p-article__pct" aria-live="off">{toBn(progress)}% পড়া হয়েছে</span>
      </div>
      <div className="c-prose-wrap" data-article-theme={theme}>
        <div className="c-prose" data-size={size} ref={(el) => { el?.style.setProperty('--prose-size', `${size}px`); }}>
          {parts.map((html, i) => (
            <div key={i} className="c-prose__part">
              <span dangerouslySetInnerHTML={{ __html: html }} />
              {adSlot && i === adAfter - 1 && adSlot}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
