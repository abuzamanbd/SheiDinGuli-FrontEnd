'use client';

import { useState } from 'react';
import type { PostCardData } from '@/lib/types';
import { toBn } from '@/lib/bn';
import { PostLine } from '../cards/Cards';
import { AdSlot } from '../AdSlot';

const TABS = [{ key: 'all', label: 'সব' }, { key: 'story', label: 'গল্প' }, { key: 'poem', label: 'কবিতা' }, { key: 'memory', label: 'স্মৃতি' }] as const;

export function AuthorTabs({ posts }: { posts: PostCardData[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('all');
  const list = tab === 'all' ? posts : posts.filter((p) => p.kind === tab);
  return (
    <div className="p-author__list" data-section="author.posts">
      <div className="p-author__tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`p-author__tab${tab === t.key ? ' is-on' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}<small>{toBn(t.key === 'all' ? posts.length : posts.filter((p) => p.kind === t.key).length)}</small>
          </button>
        ))}
      </div>
      {list.length === 0 && <p className="p-author__empty">এই বিভাগে এখনো কোনো লেখা নেই।</p>}
      {list.map((p, i) => (
        <div key={p.id}>
          <PostLine post={p} />
          {i === 1 && <div className="l-ad-row"><AdSlot slot="author.between" shape="banner" /></div>}
        </div>
      ))}
    </div>
  );
}
