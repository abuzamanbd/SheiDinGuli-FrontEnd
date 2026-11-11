'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bff } from '@/lib/bff';
import { toBn } from '@/lib/bn';
import { ARTICLE_THEMES } from '@/lib/articleThemes';
import { BODY_FONTS, type BodyFontId } from '@/lib/taxonomy';
import type { ArticleThemeKey } from '@/lib/types';
import type { EditorOptions, PostForEditor } from '@/lib/posts/api';
import { AUDIENCE_OPTIONS, emptyForm, type EditorForm } from '@/lib/posts/mapping';
import { Icon } from '../Icon';
import { RichEditor, countWords } from './RichEditor';

const AUTOSAVE_MS = 30_000;
const MIN_WORDS = (isPoem: boolean) => (isPoem ? 10 : 50);
const textOf = (html: string) => html.replace(/<\/(p|h[1-3]|li|blockquote)>|<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim();

function toForm(p: PostForEditor, opts: EditorOptions): EditorForm {
  return {
    postTypeId: p.postTypeId, subCategoryId: p.subCategoryId ?? '', title: p.title, excerpt: p.excerpt ?? '', bodyHtml: p.bodyHtml, tags: p.tags,
    audience: p.audience ?? 'all', isTrueStory: p.isTrueStory, isTranslation: p.isTranslation, originalityConfirmed: p.originalityConfirmed,
    bodyFont: (BODY_FONTS.some((f) => f.id === p.bodyFont) ? p.bodyFont : 'tiro') as BodyFontId, bodySize: p.bodySize ?? 18, poemMode: p.poemMode,
    articleTheme: (ARTICLE_THEMES.some((t) => t.key === p.articleTheme) ? p.articleTheme : '') as ArticleThemeKey | '',
    locationOn: !!(p.locationDistrictId || p.locationVillage), districtId: p.locationDistrictId ?? '', thanaId: p.locationThanaId ?? '', village: p.locationVillage ?? ''
  };
}

export function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [opts, setOpts] = useState<EditorOptions | null>(null);
  const [post, setPost] = useState<PostForEditor | null>(null);
  const [form, setForm] = useState<EditorForm>(emptyForm);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [id, setId] = useState<string | undefined>(postId);
  const [dirty, setDirty] = useState(false);
  const [saveText, setSaveText] = useState('এখনো সংরক্ষণ হয়নি');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);
  const [preview, setPreview] = useState(false);
  const [tagText, setTagText] = useState('');
  const formRef = useRef(form); formRef.current = form;
  const idRef = useRef(id); idRef.current = id;
  const savingRef = useRef(false);

  // ---- load options (+ the post when editing)
  useEffect(() => {
    let live = true;
    (async () => {
      const o = await bff<EditorOptions>('GET', 'posts/editor-options');
      if (!live) return;
      if (!o.ok || !o.data) return setLoadError(o.message);
      setOpts(o.data);
      if (postId) {
        const p = await bff<PostForEditor>('GET', `posts/${postId}`);
        if (!live) return;
        if (!p.ok || !p.data) return setLoadError(p.status === 404 ? 'লেখাটি পাওয়া যায়নি।' : p.message);
        setPost(p.data); setForm(toForm(p.data, o.data));
        setSaveText('সংরক্ষিত');
      } else {
        const first = o.data.postTypes[0];
        setForm((f) => ({ ...f, postTypeId: first?.id ?? '' }));
      }
      setReady(true);
    })();
    return () => { live = false; };
  }, [postId]);

  const set = useCallback((p: Partial<EditorForm>) => { setForm((f) => ({ ...f, ...p })); setDirty(true); }, []);

  // ---- derived
  const type = opts?.postTypes.find((t) => t.id === form.postTypeId);
  const category = opts?.categories.find((c) => c.postTypeKey === type?.key) ?? null;
  const subs = category?.children ?? [];
  const district = opts?.districts.find((d) => d.id === form.districtId);
  const words = useMemo(() => countWords(textOf(form.bodyHtml)), [form.bodyHtml]);
  const readMin = Math.max(1, Math.ceil(words / 180));
  const locked = !!post?.isLocked;
  const min = MIN_WORDS(type?.key === 'poem');
  const checks = [
    { label: 'শিরোনাম দেওয়া হয়েছে', ok: form.title.trim().length >= 3 },
    { label: 'ধরন বেছে নেওয়া হয়েছে', ok: !!category },
    { label: `লেখায় কমপক্ষে ${toBn(min)} শব্দ আছে`, ok: words >= min },
    { label: 'মৌলিকতার ঘোষণায় টিক দেওয়া হয়েছে', ok: form.originalityConfirmed }
  ];

  const payload = (f: EditorForm) => ({
    postTypeId: f.postTypeId, categoryId: category?.id, subCategoryId: f.subCategoryId || null,
    title: f.title, excerpt: f.excerpt || null, bodyHtml: f.bodyHtml, tags: f.tags,
    audience: f.audience, isTrueStory: f.isTrueStory, isTranslation: f.isTranslation, originalityConfirmed: f.originalityConfirmed,
    bodyFont: f.bodyFont, bodySize: f.bodySize, poemMode: f.poemMode, articleTheme: f.articleTheme || null,
    locationDistrictId: f.locationOn ? f.districtId || null : null, locationThanaId: f.locationOn ? f.thanaId || null : null, locationVillage: f.locationOn ? f.village || null : null
  });

  /** Saves the draft. Returns the post id, or null when it could not be saved. */
  const save = useCallback(async (quiet = false): Promise<string | null> => {
    if (savingRef.current || locked) return idRef.current ?? null;
    const f = formRef.current;
    if (!category) { if (!quiet) setToast({ text: 'আগে লেখার ধরন বেছে নিন।', tone: 'error' }); return null; }
    savingRef.current = true;
    if (!quiet) setBusy(true);
    setSaveText('সংরক্ষণ হচ্ছে…');
    const res = idRef.current
      ? await bff<{ id: string; savedAtUtc: string }>('PUT', `posts/${idRef.current}`, payload(f))
      : await bff<{ id: string; savedAtUtc: string }>('POST', 'posts', payload(f));
    savingRef.current = false;
    setBusy(false);
    if (!res.ok || !res.data) {
      setSaveText('সংরক্ষণ হয়নি');
      setToast({ text: res.message ?? 'সংরক্ষণ করা যায়নি।', tone: 'error' });
      return null;
    }
    if (!idRef.current) {
      setId(res.data.id); idRef.current = res.data.id;
      window.history.replaceState(null, '', `/write/${res.data.id}`); // keep the editor mounted, just fix the address
    }
    setDirty(false);
    setSaveText(`সংরক্ষিত · ${new Date().toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' })}`);
    if (!quiet) setToast({ text: 'খসড়া সংরক্ষণ হয়েছে।', tone: 'ok' });
    return res.data.id;
  }, [category, locked]); // eslint-disable-line react-hooks/exhaustive-deps

  // autosave
  useEffect(() => {
    if (!ready || locked) return;
    const t = setInterval(() => {
      const f = formRef.current;
      if (dirty && (f.title.trim() || textOf(f.bodyHtml))) void save(true);
    }, AUTOSAVE_MS);
    return () => clearInterval(t);
  }, [ready, locked, dirty, save]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  async function submit() {
    const failed = checks.find((c) => !c.ok);
    if (failed) return setToast({ text: `জমা দেওয়ার আগে: ${failed.label}`, tone: 'error' });
    setBusy(true);
    const savedId = await save(true);
    if (!savedId) { setBusy(false); return; }
    const res = await bff<{ published: boolean; flagged: boolean }>('POST', `posts/${savedId}/submit`);
    setBusy(false);
    if (!res.ok || !res.data) return setToast({ text: res.message ?? 'জমা দেওয়া যায়নি।', tone: 'error' });
    setToast({ text: res.data.published ? 'আপনার লেখা প্রকাশিত হয়েছে!' : 'লেখা জমা হয়েছে। সম্পাদকীয় দল শীঘ্রই পর্যালোচনা করবে।', tone: 'ok' });
    setDirty(false);
    setTimeout(() => { router.push('/panel'); router.refresh(); }, 1400);
  }

  function addTag(raw: string) {
    const t = raw.trim().replace(/^#/, '');
    if (!t || form.tags.includes(t)) return setTagText('');
    if (form.tags.length >= 5) return setToast({ text: 'সর্বোচ্চ ৫টি ট্যাগ দেওয়া যাবে।', tone: 'error' });
    set({ tags: [...form.tags, t] }); setTagText('');
  }
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 5000); return () => clearTimeout(t); }, [toast]);

  if (loadError) return <div className="p-write__state" role="alert"><p>{loadError}</p><Link href="/panel" className="c-btn">লেখক প্যানেলে ফিরুন</Link></div>;
  if (!ready || !opts) return <div className="p-write__state" aria-busy="true"><p>লোড হচ্ছে…</p></div>;

  const statusText = post ? ({ Draft: 'খসড়া', PendingReview: 'পর্যালোচনায়', Flagged: 'পর্যালোচনায়', ChangesRequested: 'সংশোধন প্রয়োজন', Published: 'প্রকাশিত', Rejected: 'বাতিল', Unpublished: 'অপ্রকাশিত' } as Record<string, string>)[post.status] ?? 'খসড়া' : 'খসড়া';

  return (
    <div className="p-write">
      <header className="p-write__top">
        <div className="p-write__wrap p-write__topbar">
          <div className="p-write__left">
            <Link href="/panel" className="c-icon-btn" aria-label="লেখক প্যানেলে ফিরুন"><Icon name="chevron" style={{ transform: 'rotate(90deg)' }} /></Link>
            <div><b>{id ? 'লেখা সম্পাদনা' : 'নতুন লেখা'}</b><small className={dirty ? 'is-dirty' : ''}><span />{saveText}</small></div>
          </div>
          <div className="p-write__right">
            <button type="button" className="c-btn c-btn--ghost p-write__hide-sm" onClick={() => setPreview(true)}><Icon name="eye" width={16} height={16} />প্রিভিউ</button>
            <button type="button" className="c-btn c-btn--ghost" disabled={busy || locked} onClick={() => void save()}>খসড়া সংরক্ষণ</button>
            <button type="button" className="c-btn" disabled={busy || locked} onClick={submit}><Icon name="send" width={16} height={16} />{opts.canPublishDirect ? 'প্রকাশ করুন' : 'জমা দিন'}</button>
          </div>
        </div>
      </header>

      <main className="p-write__wrap p-write__grid">
        <section aria-label="লেখার জায়গা" className="p-write__col">
          {locked && <div className="p-write__banner"><Icon name="info" width={18} height={18} />লেখাটি এখন পর্যালোচনায় আছে। সিদ্ধান্ত না আসা পর্যন্ত সম্পাদনা করা যাবে না।</div>}
          {post?.status === 'ChangesRequested' && post.feedback && (
            <div className="p-write__banner is-alert"><Icon name="info" width={18} height={18} /><span><b>{post.feedback.reviewerName ?? 'পর্যালোচক'}-এর মন্তব্য:</b> {post.feedback.comment}</span></div>
          )}
          <div className="p-write__titles">
            <label htmlFor="ed-title">শিরোনাম <b>*</b></label>
            <input id="ed-title" className="p-write__title" maxLength={300} disabled={locked} value={form.title} placeholder="লেখার শিরোনাম দিন" onChange={(e) => set({ title: e.target.value })} />
            <label htmlFor="ed-sub">সংক্ষিপ্ত ভূমিকা</label>
            <input id="ed-sub" className="c-input" maxLength={600} disabled={locked} value={form.excerpt} placeholder="এক-দুই লাইনে লেখাটির পরিচয় (তালিকা ও শেয়ারে দেখাবে)" onChange={(e) => set({ excerpt: e.target.value })} />
          </div>

          <RichEditor
            initialHtml={form.bodyHtml} editable={!locked}
            onChange={(html) => { if (html !== formRef.current.bodyHtml) set({ bodyHtml: html }); }}
            font={form.bodyFont} size={form.bodySize} poemMode={form.poemMode}
            onFont={(bodyFont) => set({ bodyFont })} onSize={(bodySize) => set({ bodySize })} onPoem={(poemMode) => set({ poemMode })}
          />
          <div className="p-write__meta"><span>{toBn(words)} শব্দ · আনুমানিক {toBn(readMin)} মিনিটের পাঠ</span><span><Icon name="clock" width={14} height={14} />প্রতি ৩০ সেকেন্ডে স্বয়ংক্রিয় সংরক্ষণ</span></div>
          <div className="p-write__notice"><Icon name="info" width={18} height={18} /><span>জমা দেওয়ার পর সম্পাদকীয় দল পর্যালোচনা করবে। প্রকাশনা নীতিমালার সঙ্গে সাংঘর্ষিক শব্দ থাকলে লেখাটি অতিরিক্ত যাচাইয়ের জন্য চিহ্নিত হতে পারে।</span></div>
        </section>

        <aside aria-label="লেখার সেটিংস" className="p-write__side">
          <div className="p-write__box">
            <h2>প্রকাশ</h2>
            <dl><dt>অবস্থা</dt><dd><span className="p-admin__pill is-amber">{statusText}</span></dd><dt>দৃশ্যমানতা</dt><dd>সবার জন্য</dd><dt>প্রকাশের পদ্ধতি</dt><dd>{opts.canPublishDirect ? 'সরাসরি (বিশ্বস্ত লেখক)' : 'সম্পাদকীয় পর্যালোচনার পর'}</dd></dl>
          </div>

          <div className="p-write__box">
            <h2>ধরন ও উপধরন <b>*</b></h2>
            <p>লেখাটি কোন বিভাগে দেখাবে তা বেছে নিন</p>
            <div role="radiogroup" aria-label="ধরন" className="p-write__kinds">
              {opts.postTypes.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={form.postTypeId === t.id} disabled={locked} className={`p-write__kind is-${t.key}${form.postTypeId === t.id ? ' is-on' : ''}`}
                  onClick={() => set({ postTypeId: t.id, subCategoryId: '', poemMode: t.key === 'poem' ? true : form.poemMode, articleTheme: form.articleTheme })}>{t.name}</button>
              ))}
            </div>
            {subs.length > 0 && (<>
              <label htmlFor="ed-subcat">উপধরন</label>
              <select id="ed-subcat" className="c-select" disabled={locked} value={form.subCategoryId} onChange={(e) => set({ subCategoryId: e.target.value })}>
                <option value="">— বেছে নিন —</option>{subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </>)}
          </div>

          <div className="p-write__box">
            <div className="p-write__box-head"><h2>স্থান</h2>
              <label className="p-write__check"><input type="checkbox" disabled={locked} checked={form.locationOn} onChange={(e) => set({ locationOn: e.target.checked })} />স্থান যুক্ত করুন</label></div>
            <p>গল্প বা স্মৃতির পটভূমি — পাঠকেরা এলাকা ধরে লেখা খুঁজতে পারবেন</p>
            {form.locationOn && (
              <div className="p-write__loc">
                {opts.districts.length > 0 && (<>
                  <div><label htmlFor="ed-dist">জেলা</label>
                    <select id="ed-dist" className="c-select" disabled={locked} value={form.districtId} onChange={(e) => set({ districtId: e.target.value, thanaId: '' })}>
                      <option value="">— বেছে নিন —</option>{opts.districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select></div>
                  <div><label htmlFor="ed-thana">থানা / উপজেলা</label>
                    <select id="ed-thana" className="c-select" disabled={locked || !district} value={form.thanaId} onChange={(e) => set({ thanaId: e.target.value })}>
                      <option value="">— বেছে নিন —</option>{district?.thanas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select></div>
                </>)}
                <div><label htmlFor="ed-village">গ্রাম / মহল্লা</label>
                  <input id="ed-village" className="c-input" maxLength={100} disabled={locked} value={form.village} placeholder="গ্রাম বা মহল্লার নাম লিখুন" onChange={(e) => set({ village: e.target.value })} /></div>
              </div>
            )}
          </div>

          <div className="p-write__box">
            <h2>ট্যাগ</h2><p>সর্বোচ্চ ৫টি · Enter চেপে যোগ করুন</p>
            <div className="p-write__tags">
              {form.tags.map((t) => <span key={t} className="p-write__tag">{t}<button type="button" aria-label={`${t} ট্যাগ সরান`} disabled={locked} onClick={() => set({ tags: form.tags.filter((x) => x !== t) })}><Icon name="close" width={12} height={12} /></button></span>)}
              <label className="u-sr-only" htmlFor="ed-tag">নতুন ট্যাগ</label>
              <input id="ed-tag" disabled={locked} value={tagText} placeholder="নতুন ট্যাগ…" onChange={(e) => setTagText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagText); } else if (e.key === 'Backspace' && !tagText && form.tags.length) set({ tags: form.tags.slice(0, -1) }); }} />
            </div>
          </div>

          <div className="p-write__box">
            <h2>পাঠের থিম</h2><p>পাঠকেরা লেখাটি কোন সাজে পড়বেন (পাঠক চাইলে বদলাতে পারবেন)</p>
            <select className="c-select" aria-label="পাঠের থিম" disabled={locked} value={form.articleTheme} onChange={(e) => set({ articleTheme: e.target.value as ArticleThemeKey | '' })}>
              <option value="">সাইটের ডিফল্ট</option>{ARTICLE_THEMES.map((t) => <option key={t.key} value={t.key}>{t.name} — {t.bestFor}</option>)}
            </select>
          </div>

          <div className="p-write__box">
            <h2>আরও তথ্য</h2>
            <label htmlFor="ed-aud">উপযুক্ত পাঠক</label>
            <select id="ed-aud" className="c-select" disabled={locked} value={form.audience} onChange={(e) => set({ audience: e.target.value })}>
              {AUDIENCE_OPTIONS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
            <label className="p-write__check"><input type="checkbox" disabled={locked} checked={form.isTrueStory} onChange={(e) => set({ isTrueStory: e.target.checked })} />সত্য ঘটনা অবলম্বনে</label>
            <label className="p-write__check"><input type="checkbox" disabled={locked} checked={form.isTranslation} onChange={(e) => set({ isTranslation: e.target.checked })} />এটি একটি অনুবাদ</label>
            <label className="p-write__check"><input type="checkbox" disabled={locked} checked={form.originalityConfirmed} onChange={(e) => set({ originalityConfirmed: e.target.checked })} />
              <span>আমি নিশ্চিত করছি যে এটি আমার নিজের মৌলিক লেখা এবং প্রকাশনা নীতিমালা মেনে লেখা হয়েছে। <b>*</b></span></label>
          </div>

          <div className="p-write__box">
            <h2>জমা দেওয়ার আগে</h2>
            <ul className="p-write__checks">{checks.map((c) => <li key={c.label} className={c.ok ? 'is-ok' : ''}><span>{c.ok ? <Icon name="check" width={12} height={12} /> : null}</span>{c.label}</li>)}</ul>
          </div>
        </aside>
      </main>

      {preview && (
        <div className="c-modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setPreview(false)}>
          <div className="p-write__preview" role="dialog" aria-modal="true" aria-label="প্রিভিউ" data-article-theme={form.articleTheme || undefined}>
            <button type="button" className="c-icon-btn p-write__preview-close" onClick={() => setPreview(false)} aria-label="বন্ধ করুন"><Icon name="close" /></button>
            <h1>{form.title || 'শিরোনামহীন'}</h1>
            {form.excerpt && <p className="p-write__preview-sub">{form.excerpt}</p>}
            <div className={`c-editor${form.poemMode ? ' is-poem' : ''}`} data-font={form.bodyFont} data-size={form.bodySize}>
              <div className="c-editor__prose" dangerouslySetInnerHTML={{ __html: form.bodyHtml }} />
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`p-write__toast is-${toast.tone}`} role="status"><span>{toast.text}</span><button type="button" aria-label="বন্ধ করুন" onClick={() => setToast(null)}><Icon name="close" width={14} height={14} /></button></div>}
    </div>
  );
}
