'use client';

import type { ArticleThemeKey } from '@/lib/types';
import { ARTICLE_THEMES } from '@/lib/articleThemes';
import { Icon } from '../Icon';

/** Author chooses how the article will look. Each option explains itself in plain Bengali. */
export function ThemePicker({ value, onChange }: { value: ArticleThemeKey; onChange: (k: ArticleThemeKey) => void }) {
  return (
    <div className="c-theme-picker" role="radiogroup" aria-label="লেখার থিম">
      <div className="c-theme-picker__list">
        {ARTICLE_THEMES.map((t) => (
          <button key={t.key} type="button" role="radio" aria-checked={value === t.key} className={`c-theme-picker__option${value === t.key ? ' is-on' : ''}`} onClick={() => onChange(t.key)} data-article-theme={t.key}>
            <span className="c-theme-picker__swatch" data-swatch={t.key}>অ</span>
            <span className="c-theme-picker__name">{t.name}{value === t.key && <span className="c-theme-picker__tick"><Icon name="check" /></span>}</span>
            <span className="c-theme-picker__desc">{t.description}</span>
            <span className="c-theme-picker__best">উপযোগী: {t.bestFor}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
