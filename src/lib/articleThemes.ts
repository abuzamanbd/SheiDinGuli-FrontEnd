import type { ArticleThemeInfo } from '@/lib/types';

/** Themes an author can pick for a post. The look of each one is in styles/themes/article. */
export const ARTICLE_THEMES: ArticleThemeInfo[] = [
  { key: 'classic', name: 'ক্লাসিক', description: 'বইয়ের মতো সেরিফ লেখা, প্রথম অক্ষর বড়।', bestFor: 'গল্প ও প্রবন্ধ' },
  { key: 'modern', name: 'আধুনিক', description: 'পরিষ্কার সহজপাঠ্য লেখা, বাঁ দিক ঘেঁষা।', bestFor: 'মতামত ও দৈনন্দিন লেখা' },
  { key: 'poetry', name: 'কাব্য', description: 'মাঝখানে সাজানো, লাইনের ফাঁক বেশি।', bestFor: 'কবিতা ও ছড়া' },
  { key: 'nostalgia', name: 'স্মৃতির পাতা', description: 'পুরনো কাগজের মতো উষ্ণ হলদে পটভূমি।', bestFor: 'শৈশবের স্মৃতি' },
  { key: 'night', name: 'রাতের পাঠ', description: 'গাঢ় পটভূমি, চোখে আরাম।', bestFor: 'রাতে পড়ার লেখা' }
];
