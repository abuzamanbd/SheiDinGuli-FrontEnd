'use client';

import { useState } from 'react';
import type { ArticleThemeKey } from '@/lib/types';
import { ThemePicker } from '../article/ThemePicker';

export function ArticleThemeLab({ sample }: { sample: string }) {
  const [theme, setTheme] = useState<ArticleThemeKey>('classic');
  return (
    <>
      <ThemePicker value={theme} onChange={setTheme} />
      <div className="c-theme-picker__preview">
        <div className="l-wrap l-wrap--read p-design">
          <div className="c-prose-wrap" data-article-theme={theme}><div className="c-prose" dangerouslySetInnerHTML={{ __html: sample }} /></div>
        </div>
      </div>
    </>
  );
}
