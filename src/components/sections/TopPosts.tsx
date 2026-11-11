'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { PostCardData } from '@/lib/types';
import { toBn, formatCountShort } from '@/lib/bn';
import { Icon } from '../Icon';

export type Period = 'day' | 'week' | 'month' | 'all';
const LABELS: Record<Period, string> = { day: 'আজ', week: 'সপ্তাহ', month: 'মাস', all: 'সর্বকালের' };

export function TopPosts({ title, byPeriod, defaultPeriod, metric, linkLabel, linkHref, light, sectionKey }: {
  title: string; byPeriod: Record<Period, PostCardData[]>; defaultPeriod: Period; metric: 'views' | 'likes';
  linkLabel?: string; linkHref?: string; light?: boolean; sectionKey: string;
}) {
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const list = byPeriod[period] ?? [];
  return (
    <aside className={`s-top${light ? ' s-top--light' : ''}`} data-section={sectionKey}>
      <div className="s-top__head">
        <h2 className="s-top__title"><Icon name="flame" />{title}</h2>
        <div className="s-top__tabs" role="tablist">
          {(Object.keys(LABELS) as Period[]).map((p) => (
            <button key={p} type="button" role="tab" aria-selected={period === p} className={`s-top__tab${period === p ? ' is-on' : ''}`} onClick={() => setPeriod(p)}>{LABELS[p]}</button>
          ))}
        </div>
      </div>
      <ol>
        {list.map((p, k) => (
          <li key={p.id} className={`s-top__item is-${p.kind}`}>
            <Link href={`/post/${p.slug}`} className="s-top__link">
              <span className="s-top__num">{toBn(k + 1)}</span>
              <span className="s-top__text">
                <span className="s-top__name">{p.title}</span>
                <span className="s-top__by"><b>{p.authorName}</b> · {formatCountShort(metric === 'views' ? p.views : p.likes)} {metric === 'views' ? 'পঠিত' : 'পছন্দ'}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {linkLabel && linkHref && <Link href={linkHref} className="s-top__all"><span>{linkLabel}</span><Icon name="arrowRight" width={16} height={16} /></Link>}
    </aside>
  );
}
