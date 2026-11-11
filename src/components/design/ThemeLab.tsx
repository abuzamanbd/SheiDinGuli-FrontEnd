'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import type { PostCardData, ThemePreset } from '@/lib/types';
import { DEFAULT_TOKENS, FONT_CHOICES, TOKENS, TOKEN_GROUPS, cssVarName, isSafeValue } from '@/lib/theme/tokens';
import { PoemCard, PostCard } from '../cards/Cards';

/** Prototype of the admin theme editor. Changes apply only to the preview box, and nothing is saved. */
export function ThemeLab({ presets, posts }: { presets: ThemePreset[]; posts: PostCardData[] }) {
  const [presetId, setPresetId] = useState(presets[0].id);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const ref = useRef<HTMLDivElement>(null);

  const values = useMemo(() => {
    const preset = presets.find((p) => p.id === presetId);
    return { ...DEFAULT_TOKENS, ...(preset?.tokens ?? {}), ...edits };
  }, [presetId, edits, presets]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    for (const t of TOKENS) {
      const v = values[t.key];
      if (v && isSafeValue(v)) el.style.setProperty(cssVarName(t.key), v);
    }
  }, [values]);

  const story = posts.find((p) => p.kind === 'story');
  const poem = posts.find((p) => p.kind === 'poem');

  return (
    <div className="p-design__lab">
      <div className="p-design__panel">
        <h2 className="s-box__title">রেডিমেড থিম</h2>
        <div className="p-design__presets">
          {presets.map((p) => (
            <button key={p.id} type="button" className={`p-design__preset${presetId === p.id ? ' is-on' : ''}`} onClick={() => { setPresetId(p.id); setEdits({}); }}>
              <strong>{p.name}</strong><small>{p.description}</small>
            </button>
          ))}
        </div>
        {TOKEN_GROUPS.map((g) => (
          <div key={g.key} className="p-design__group">
            <h3>{g.label}</h3><p>{g.hint}</p>
            {TOKENS.filter((t) => t.group === g.key).map((t) => (
              <label key={t.key} className="p-design__token">
                <span>{t.label}</span>
                {t.type === 'color' && /^#[0-9a-f]{6}$/i.test(values[t.key]) ? (
                  <input type="color" value={values[t.key]} onChange={(e) => setEdits({ ...edits, [t.key]: e.target.value })} />
                ) : t.type === 'font' ? (
                  <select value={values[t.key]} onChange={(e) => setEdits({ ...edits, [t.key]: e.target.value })}>
                    {FONT_CHOICES.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
                  </select>
                ) : (
                  <input type="text" value={values[t.key]} onChange={(e) => setEdits({ ...edits, [t.key]: e.target.value })} />
                )}
              </label>
            ))}
          </div>
        ))}
      </div>

      <div className="p-design__preview" ref={ref}>
        <div className="s-topbar"><div className="s-topbar__inner"><span>টপবার — তারিখ ও লিংক</span></div></div>
        <div className="p-design__sample">
          <div className="p-design__row"><button type="button" className="c-btn">বাটন</button><button type="button" className="c-btn c-btn--accent">অ্যাকসেন্ট</button><button type="button" className="c-btn c-btn--outline">আউটলাইন</button></div>
          <div className="p-design__row"><span className="c-chip">প্রেম</span><span className="c-chip">বর্ষা</span><span className="c-badge c-badge--solid">গল্প</span><span className="c-badge c-badge--accent">নতুন</span></div>
          <div className="s-grid">
            {story && <PostCard post={story} small />}
            {poem && <PoemCard post={poem} light />}
          </div>
          {poem && <div className="s-band"><div className="s-band__inner"><PoemCard post={poem} /></div></div>}
        </div>
      </div>
    </div>
  );
}
