import type { BodyFontId } from '@/lib/taxonomy';
import type { ArticleThemeKey } from '@/lib/types';

/** Audience keys stored by the API <-> labels shown in the editor. */
export const AUDIENCE_OPTIONS: { key: string; label: string }[] = [
  { key: 'all', label: 'সবার জন্য' },
  { key: 'children', label: 'শিশু-কিশোরদের জন্য' },
  { key: 'adult', label: 'প্রাপ্তবয়স্কদের জন্য (১৮+)' }
];

/** Everything the writing screen edits, in the shape of the form (ids are API ids). */
export interface EditorForm {
  postTypeId: string;
  subCategoryId: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  tags: string[];
  audience: string;
  isTrueStory: boolean;
  isTranslation: boolean;
  originalityConfirmed: boolean;
  bodyFont: BodyFontId;
  bodySize: number;
  poemMode: boolean;
  articleTheme: ArticleThemeKey | '';
  locationOn: boolean;
  districtId: string;
  thanaId: string;
  village: string;
}

export const emptyForm = (): EditorForm => ({
  postTypeId: '', subCategoryId: '', title: '', excerpt: '', bodyHtml: '', tags: [], audience: 'all', isTrueStory: false, isTranslation: false,
  originalityConfirmed: false, bodyFont: 'tiro', bodySize: 18, poemMode: false, articleTheme: '', locationOn: false, districtId: '', thanaId: '', village: ''
});
