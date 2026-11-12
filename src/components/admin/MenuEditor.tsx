'use client';

import { useCallback, useEffect, useState } from 'react';
import { bff } from '@/lib/bff';

type ItemType = 'category' | 'custom' | 'heading';
interface Node { uid: string; label: string; type: ItemType; targetId: string | null; url: string; openInNewTab: boolean; isActive: boolean; isMega: boolean; children: Node[] }
interface ApiItem { label: string; type: string; targetId: string | null; url: string | null; openInNewTab: boolean; isActive: boolean; isMega: boolean; children: ApiItem[] }
interface Category { id: string; name: string; slug: string; parentId: string | null }

const MENUS: [string, string][] = [['header_main', 'প্রধান মেনু (হেডার)'], ['footer', 'ফুটার মেনু']];
let seq = 0;
const uid = () => `n${++seq}`;
const blank = (type: ItemType = 'category'): Node => ({ uid: uid(), label: '', type, targetId: null, url: '', openInNewTab: false, isActive: true, isMega: false, children: [] });
const fromApi = (a: ApiItem): Node => ({
  uid: uid(), label: a.label, type: (['category', 'custom', 'heading'].includes(a.type) ? a.type : 'custom') as ItemType, targetId: a.targetId, url: a.url ?? '',
  openInNewTab: a.openInNewTab, isActive: a.isActive, isMega: a.isMega, children: a.children.map(fromApi)
});
const toApi = (n: Node): ApiItem => ({
  label: n.label.trim(), type: n.type, targetId: n.type === 'category' ? n.targetId : null, url: n.type === 'custom' ? n.url.trim() : null,
  openInNewTab: n.openInNewTab, isActive: n.isActive, isMega: n.isMega, children: n.children.map(toApi)
});

/** Replaces the node with `uid` (or removes it when fn returns null) anywhere in the tree. */
function edit(list: Node[], id: string, fn: (n: Node) => Node | null): Node[] {
  return list.flatMap((n) => {
    if (n.uid === id) { const r = fn(n); return r ? [r] : []; }
    return [{ ...n, children: edit(n.children, id, fn) }];
  });
}
function move(list: Node[], id: string, dir: -1 | 1): Node[] {
  const i = list.findIndex((n) => n.uid === id);
  if (i >= 0) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return list;
    const copy = [...list]; [copy[i], copy[j]] = [copy[j], copy[i]]; return copy;
  }
  return list.map((n) => ({ ...n, children: move(n.children, id, dir) }));
}
const validate = (list: Node[]): string | null => {
  for (const n of list) {
    if (!n.label.trim()) return 'প্রতিটি আইটেমের একটি নাম দিন।';
    if (n.type === 'category' && !n.targetId) return `“${n.label}” — একটি বিভাগ বেছে নিন।`;
    if (n.type === 'custom' && !/^(\/(?!\/)|https?:\/\/)/i.test(n.url.trim())) return `“${n.label}” — লিংক / বা http(s):// দিয়ে শুরু হতে হবে।`;
    const e = validate(n.children); if (e) return e;
  }
  return null;
};

/** Menu editor: add, rename, reorder, hide and remove items, up to three levels. Hidden items stay saved but are not shown on the site. */
export function MenuEditor() {
  const [menuKey, setMenuKey] = useState(MENUS[0][0]);
  const [items, setItems] = useState<Node[] | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setItems(null); setDirty(false);
    const [m, c] = await Promise.all([bff<ApiItem[]>('GET', `admin/menus/${menuKey}`), bff<Category[]>('GET', 'admin/categories')]);
    if (c.data) setCats(c.data);
    if (m.ok && m.data) { setItems(m.data.map(fromApi)); setError(null); } else { setItems([]); setError(m.message); }
  }, [menuKey]);
  useEffect(() => { void load(); }, [load]);

  const change = (fn: (l: Node[]) => Node[]) => { setItems((l) => fn(l ?? [])); setDirty(true); setOk(null); };

  async function save() {
    const list = items ?? [];
    const v = validate(list);
    if (v) { setError(v); return; }
    setBusy(true); setError(null); setOk(null);
    const r = await bff('PUT', `admin/menus/${menuKey}`, { items: list.map(toApi) });
    setBusy(false);
    if (r.ok) { setOk('মেনু সংরক্ষণ হয়েছে। সাইটে কিছুক্ষণের মধ্যেই দেখা যাবে।'); setDirty(false); await load(); } else setError(r.message);
  }

  function row(n: Node, depth: number) {
    const siblingsHeadingAllowed = depth >= 2;
    return (
      <li key={n.uid} className={`c-menued__item${n.isActive ? '' : ' is-off'}`}>
        <div className="c-menued__row">
          <span className="c-menued__move">
            <button type="button" aria-label="ওপরে" onClick={() => change((l) => move(l, n.uid, -1))}>▲</button>
            <button type="button" aria-label="নিচে" onClick={() => change((l) => move(l, n.uid, 1))}>▼</button>
          </span>
          <input className="c-menued__label" value={n.label} placeholder={n.type === 'heading' ? 'কলামের শিরোনাম' : 'মেনুর নাম'} maxLength={100}
            aria-label="মেনুর নাম" onChange={(e) => change((l) => edit(l, n.uid, (x) => ({ ...x, label: e.target.value })))} />
          <select value={n.type} aria-label="ধরন" onChange={(e) => change((l) => edit(l, n.uid, (x) => ({ ...x, type: e.target.value as ItemType })))}>
            <option value="category">বিভাগ</option>
            <option value="custom">নিজের লিংক</option>
            {siblingsHeadingAllowed && <option value="heading">কলামের শিরোনাম</option>}
          </select>
          {n.type === 'category' && (
            <select value={n.targetId ?? ''} aria-label="বিভাগ" onChange={(e) => change((l) => edit(l, n.uid, (x) => ({ ...x, targetId: e.target.value || null })))}>
              <option value="">বিভাগ বাছুন…</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.parentId ? '— ' : ''}{c.name}</option>)}
            </select>
          )}
          {n.type === 'custom' && (
            <input className="c-menued__url" value={n.url} placeholder="/ অথবা https://…" aria-label="লিংক" onChange={(e) => change((l) => edit(l, n.uid, (x) => ({ ...x, url: e.target.value })))} />
          )}
          <label className="c-menued__chk" title="বন্ধ করলে সাইটে দেখা যাবে না, কিন্তু মেনুতে সংরক্ষিত থাকবে">
            <input type="checkbox" checked={n.isActive} onChange={(e) => change((l) => edit(l, n.uid, (x) => ({ ...x, isActive: e.target.checked })))} /> দেখান
          </label>
          {depth === 1 && n.children.length > 0 && (
            <label className="c-menued__chk" title="বড় ড্রপডাউন: কলাম আর নতুন লেখাসহ">
              <input type="checkbox" checked={n.isMega} onChange={(e) => change((l) => edit(l, n.uid, (x) => ({ ...x, isMega: e.target.checked })))} /> বড় মেনু
            </label>
          )}
          {depth < 3 && <button type="button" className="c-btn c-btn--sm c-btn--outline" onClick={() => change((l) => edit(l, n.uid, (x) => ({ ...x, children: [...x.children, blank(depth === 2 ? 'category' : 'category')] })))}>+ উপমেনু</button>}
          <button type="button" className="c-menued__del" aria-label="মুছুন" onClick={() => { if (window.confirm(`“${n.label || 'এই আইটেম'}” ও এর উপমেনু মুছে ফেলবেন?`)) change((l) => edit(l, n.uid, () => null)); }}>✕</button>
        </div>
        {n.children.length > 0 && <ul className="c-menued__list">{n.children.map((c) => row(c, depth + 1))}</ul>}
      </li>
    );
  }

  return (
    <section className="p-admin__card" data-section="admin.menus">
      <div className="p-admin__card-head">
        <h2>মেনু</h2>
        <div className="p-admin__tabs" role="tablist">
          {MENUS.map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={menuKey === k} className={menuKey === k ? 'is-on' : ''} onClick={() => { if (!dirty || window.confirm('সংরক্ষণ না করা পরিবর্তন হারিয়ে যাবে। এগোবেন?')) setMenuKey(k); }}>{label}</button>)}
        </div>
      </div>
      <p className="c-menued__help">নাম বদলান, ওপর-নিচে সরান, লুকান বা মুছুন। “বড় মেনু” চালু করলে একটি বিভাগের নিচে কলামে সাজানো উপমেনু আর নতুন লেখা দেখা যায়। উপমেনু সর্বোচ্চ ৩ স্তর পর্যন্ত।</p>

      {items === null && !error && <p className="p-admin__empty">লোড হচ্ছে…</p>}
      {items && items.length === 0 && !error && <p className="p-admin__empty">এই মেনুতে এখনো কিছু নেই।</p>}
      {items && <ul className="c-menued__list c-menued__list--root">{items.map((n) => row(n, 1))}</ul>}

      {error && <p className="p-admin__error" role="alert">{error}</p>}
      {ok && <p className="p-admin__ok" role="status">{ok}</p>}
      <div className="c-menued__foot">
        <button type="button" className="c-btn c-btn--outline" onClick={() => change((l) => [...l, blank('custom')])}>+ নতুন মেনু</button>
        <button type="button" className="c-btn" disabled={busy || !dirty} onClick={save}>{busy ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</button>
      </div>
    </section>
  );
}
