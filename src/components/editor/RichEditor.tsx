'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { Icon, type IconName } from '../Icon';
import { BODY_FONTS, BODY_SIZES, type BodyFontId } from '@/lib/taxonomy';
import { toBn } from '@/lib/bn';

/** In poem mode Enter makes a new line (not a new paragraph); Enter on an empty line starts a new stanza. */
const PoemEnter = (isPoem: () => boolean) => Extension.create({
  name: 'poemEnter',
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (!isPoem()) return false;
        const { $from } = editor.state.selection;
        const before = $from.nodeBefore;
        if (before?.type.name === 'hardBreak') {
          return editor.chain().command(({ tr, dispatch }) => { if (dispatch) tr.delete($from.pos - 1, $from.pos); return true; }).splitBlock().run();
        }
        return editor.commands.setHardBreak();
      }
    };
  }
});

interface Props {
  initialHtml: string;
  onChange: (html: string, words: number) => void;
  font: BodyFontId;
  size: number;
  poemMode: boolean;
  onFont: (f: BodyFontId) => void;
  onSize: (s: number) => void;
  onPoem: (on: boolean) => void;
  editable?: boolean;
}

export function RichEditor({ initialHtml, onChange, font, size, poemMode, onFont, onSize, onPoem, editable = true }: Props) {
  const poemRef = useRef(poemMode);
  poemRef.current = poemMode;
  const [panel, setPanel] = useState<null | 'link' | 'image'>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: false, HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' } } }),
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
      Placeholder.configure({ placeholder: 'এখানে আপনার লেখা শুরু করুন…' }),
      PoemEnter(() => poemRef.current)
    ],
    content: initialHtml,
    editable,
    editorProps: { attributes: { 'aria-label': 'লেখার মূল অংশ', class: 'c-editor__prose' } },
    onUpdate: ({ editor: e }) => onChange(e.getHTML(), countWords(e.getText()))
  });

  useEffect(() => { if (editor && editor.isEditable !== editable) editor.setEditable(editable); }, [editor, editable]);
  useEffect(() => { if (editor) onChange(editor.getHTML(), countWords(editor.getText())); /* initial count */ }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return <div className="c-editor__loading" aria-busy="true" />;

  return (
    <div className={`c-editor${poemMode ? ' is-poem' : ''}`} data-font={font} data-size={size}>
      {editable && <Toolbar editor={editor} font={font} size={size} poemMode={poemMode} onFont={onFont} onSize={onSize} onPoem={onPoem} panel={panel} setPanel={setPanel} />}
      <EditorContent editor={editor} className="c-editor__body" />
    </div>
  );
}

export const countWords = (text: string) => { const t = text.trim(); return t ? t.split(/\s+/).length : 0; };

function Toolbar({ editor, font, size, poemMode, onFont, onSize, onPoem, panel, setPanel }: Omit<Props, 'initialHtml' | 'onChange'> & { editor: Editor; panel: null | 'link' | 'image'; setPanel: (p: null | 'link' | 'image') => void }) {
  const btn = (label: string, on: boolean, run: () => void, content: React.ReactNode, extra = '') => (
    <button type="button" className={`c-tb${on ? ' is-on' : ''}${extra}`} aria-label={label} aria-pressed={on} title={label} onMouseDown={(e) => e.preventDefault()} onClick={run}>{content}</button>
  );
  const icon = (name: IconName) => <Icon name={name} width={18} height={18} />;
  const block = editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('blockquote') ? 'quote' : 'p';
  const setBlock = (v: string) => {
    const c = editor.chain().focus();
    if (v === 'h2') c.setHeading({ level: 2 }).run();
    else if (v === 'h3') c.setHeading({ level: 3 }).run();
    else if (v === 'quote') c.setParagraph().setBlockquote().run();
    else { if (editor.isActive('blockquote')) c.lift('blockquote').run(); else c.setParagraph().run(); }
  };
  const aligns: { id: string; label: string; icon: IconName }[] = [
    { id: 'left', label: 'বামে', icon: 'alignLeft' }, { id: 'center', label: 'মাঝে', icon: 'alignCenter' },
    { id: 'right', label: 'ডানে', icon: 'alignRight' }, { id: 'justify', label: 'দুই পাশে সমান', icon: 'alignJustify' }
  ];

  return (
    <div className="c-editor__toolbar-wrap">
      <div className="c-editor__toolbar" role="toolbar" aria-label="লেখার ফরম্যাট">
        <select className="c-select c-select--sm" aria-label="ফন্ট" value={font} onChange={(e) => onFont(e.target.value as BodyFontId)}>
          {BODY_FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
        <select className="c-select c-select--sm c-select--narrow" aria-label="লেখার আকার" value={size} onChange={(e) => onSize(Number(e.target.value))}>
          {BODY_SIZES.map((s) => <option key={s} value={s}>{toBn(s)}</option>)}
        </select>
        <select className="c-select c-select--sm" aria-label="অনুচ্ছেদের ধরন" value={block} onChange={(e) => setBlock(e.target.value)}>
          <option value="p">সাধারণ লেখা</option><option value="h2">শিরোনাম ১</option><option value="h3">শিরোনাম ২</option><option value="quote">উদ্ধৃতি</option>
        </select>
        <span className="c-editor__sep" aria-hidden="true" />
        {btn('মোটা', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <b>B</b>)}
        {btn('বাঁকা', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <i>I</i>)}
        {btn('নিচে দাগ', editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <u>U</u>)}
        {btn('কাটা দাগ', editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), <s>S</s>)}
        <span className="c-editor__sep" aria-hidden="true" />
        <div className="c-editor__aligns" role="group" aria-label="সারিবদ্ধতা">
          {aligns.map((a) => btn(a.label, editor.isActive({ textAlign: a.id }), () => editor.chain().focus().setTextAlign(a.id).run(), icon(a.icon), ' c-tb--align'))}
        </div>
        <span className="c-editor__sep" aria-hidden="true" />
        {btn('বুলেট তালিকা', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), icon('list'))}
        {btn('উদ্ধৃতি', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), icon('quote'))}
        {btn('লিংক যোগ করুন', editor.isActive('link') || panel === 'link', () => setPanel(panel === 'link' ? null : 'link'), icon('link'))}
        {btn('ছবি যোগ করুন', panel === 'image', () => setPanel(panel === 'image' ? null : 'image'), icon('image'))}
        {btn('বিভাজক রেখা', false, () => editor.chain().focus().setHorizontalRule().run(), icon('divider'))}
        <span className="c-editor__sep" aria-hidden="true" />
        {btn('আগের অবস্থায় ফিরুন', false, () => editor.chain().focus().undo().run(), icon('undo'))}
        {btn('পুনরায় করুন', false, () => editor.chain().focus().redo().run(), icon('redo'))}
        <button type="button" className={`c-editor__poem${poemMode ? ' is-on' : ''}`} aria-pressed={poemMode} onClick={() => onPoem(!poemMode)} title="প্রতিটি Enter-এ নতুন লাইন, ফাঁকা লাইনে নতুন স্তবক">
          <Icon name="feather" width={15} height={15} />কবিতা মোড
        </button>
      </div>
      {panel && <InsertPanel kind={panel} editor={editor} close={() => setPanel(null)} />}
    </div>
  );
}

function InsertPanel({ kind, editor, close }: { kind: 'link' | 'image'; editor: Editor; close: () => void }) {
  const [url, setUrl] = useState(kind === 'link' ? (editor.getAttributes('link').href as string | undefined) ?? '' : '');
  const [error, setError] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);

  const apply = () => {
    const v = url.trim();
    if (kind === 'link' && !v) { editor.chain().focus().extendMarkRange('link').unsetLink().run(); close(); return; }
    if (!/^https?:\/\/\S+$/i.test(v)) { setError('https:// দিয়ে শুরু হওয়া সঠিক ঠিকানা দিন'); return; }
    if (kind === 'link') editor.chain().focus().extendMarkRange('link').setLink({ href: v }).run();
    else editor.chain().focus().setImage({ src: v }).run();
    close();
  };

  return (
    <div className="c-editor__insert">
      <label className="c-editor__insert-label" htmlFor="ed-insert">{kind === 'link' ? 'লিংকের ঠিকানা' : 'ছবির ঠিকানা (URL)'}</label>
      <input id="ed-insert" ref={ref} className="c-input" value={url} placeholder="https://" onChange={(e) => { setUrl(e.target.value); setError(''); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } if (e.key === 'Escape') close(); }} aria-invalid={error ? 'true' : undefined} />
      <button type="button" className="c-btn" onClick={apply}>{kind === 'link' ? 'যোগ করুন' : 'ছবি বসান'}</button>
      <button type="button" className="c-btn c-btn--ghost" onClick={close}>বাতিল</button>
      {error && <span className="c-field__error">{error}</span>}
      {kind === 'image' && !error && <span className="c-field__hint">ছবি আপলোড সুবিধা সার্ভার যুক্ত হওয়ার পর আসবে; এখন ছবির লিংক বসানো যাবে।</span>}
    </div>
  );
}
