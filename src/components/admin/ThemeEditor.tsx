'use client';

import { useEffect, useMemo, useState } from 'react';
import { bff } from '@/lib/bff';
import { FONT_CHOICES, TOKENS, TOKEN_GROUPS, cssVarName, isSafeValue, type TokenDef } from '@/lib/theme/tokens';

/** Colours, fonts and sizes of the whole site. Changes show on this page at once; "সংরক্ষণ" makes them live for everyone. */
export function ThemeEditor() {
  const [saved, setSaved] = useState<Record<string, string> | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string>('brand');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    void bff<{ tokens: Record<string, string> }>('GET', 'admin/settings/theme').then((r) => {
      const t = r.data?.tokens ?? {};
      setSaved(t); setValues(t);
      if (!r.ok) setError(r.message);
    });
  }, []);

  // Live preview: write the chosen values onto the page; take them off again when leaving this screen.
  useEffect(() => {
    const root = document.documentElement;
    for (const t of TOKENS) {
      const v = values[t.key];
      if (v && isSafeValue(v)) root.style.setProperty(cssVarName(t.key), v); else root.style.removeProperty(cssVarName(t.key));
    }
  }, [values]);
  useEffect(() => () => { for (const t of TOKENS) document.documentElement.style.removeProperty(cssVarName(t.key)); }, []);

  const dirty = useMemo(() => saved !== null && JSON.stringify(sorted(values)) !== JSON.stringify(sorted(saved)), [values, saved]);
  const set = (key: string, v: string) => { setValues((o) => ({ ...o, [key]: v })); setOk(null); };
  const reset = (key: string) => { setValues((o) => { const { [key]: _, ...rest } = o; return rest; }); setOk(null); };

  async function save() {
    setBusy(true); setError(null); setOk(null);
    const clean = Object.fromEntries(Object.entries(values).filter(([k, v]) => TOKENS.some((t) => t.key === k && v !== t.default) && isSafeValue(v)));
    const r = await bff('PUT', 'admin/settings/theme', { tokens: clean });
    setBusy(false);
    if (r.ok) { setSaved(clean); setValues(clean); setOk('সংরক্ষণ হয়েছে। সাইটে কিছুক্ষণের মধ্যেই নতুন রং ও ফন্ট দেখা যাবে।'); } else setError(r.message);
  }

  function field(t: TokenDef) {
    const v = values[t.key] ?? t.default;
    const changed = t.key in values;
    return (
      <div key={t.key} className="c-themed__field">
        <label htmlFor={`t-${t.key}`}>{t.label}{t.hint && <small>{t.hint}</small>}</label>
        <div className="c-themed__input">
          {t.type === 'color' && <input type="color" id={`t-${t.key}`} value={/^#[0-9a-f]{6}$/i.test(v) ? v : '#000000'} onChange={(e) => set(t.key, e.target.value.toUpperCase())} />}
          {t.type === 'color' && <input type="text" value={v} maxLength={9} aria-label={`${t.label} (কোড)`} onChange={(e) => set(t.key, e.target.value)} />}
          {t.type === 'font' && (
            <select id={`t-${t.key}`} value={FONT_CHOICES.some((f) => f.value === v) ? v : ''} onChange={(e) => set(t.key, e.target.value)}>
              {!FONT_CHOICES.some((f) => f.value === v) && <option value="">বর্তমান ফন্ট</option>}
              {FONT_CHOICES.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
            </select>
          )}
          {t.type === 'size' && <input type="text" id={`t-${t.key}`} value={v} maxLength={20} onChange={(e) => set(t.key, e.target.value)} />}
          <button type="button" className="c-themed__reset" disabled={!changed} onClick={() => reset(t.key)} title="আগের মানে ফিরুন">↺</button>
        </div>
      </div>
    );
  }

  return (
    <section className="p-admin__card" data-section="admin.theme">
      <div className="p-admin__card-head"><h2>রং ও ফন্ট</h2></div>
      <p className="c-menued__help">যেকোনো রং বা ফন্ট বদলালে এই পাতায় সঙ্গে সঙ্গে দেখতে পাবেন। পছন্দ হলে নিচে “সংরক্ষণ করুন” চাপুন, তখন পুরো সাইটে পাল্টে যাবে।</p>
      {saved === null && !error && <p className="p-admin__empty">লোড হচ্ছে…</p>}
      {saved !== null && TOKEN_GROUPS.map((g) => (
        <div key={g.key} className="c-themed__group">
          <button type="button" className="c-themed__head" aria-expanded={open === g.key} onClick={() => setOpen(open === g.key ? '' : g.key)}>
            <b>{g.label}</b><small>{g.hint}</small><span aria-hidden="true">{open === g.key ? '−' : '+'}</span>
          </button>
          {open === g.key && <div className="c-themed__body">{TOKENS.filter((t) => t.group === g.key).map(field)}</div>}
        </div>
      ))}
      {error && <p className="p-admin__error" role="alert">{error}</p>}
      {ok && <p className="p-admin__ok" role="status">{ok}</p>}
      <div className="c-menued__foot">
        <button type="button" className="c-btn c-btn--outline" disabled={Object.keys(values).length === 0} onClick={() => { setValues({}); setOk(null); }}>সব ডিফল্টে ফেরান</button>
        <button type="button" className="c-btn" disabled={busy || !dirty} onClick={save}>{busy ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</button>
      </div>
    </section>
  );
}

const sorted = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
