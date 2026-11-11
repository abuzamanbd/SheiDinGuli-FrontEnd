import type { PostKind } from '@/lib/types';

/**
 * Sample categories and places for the editor. In production these come from the API
 * (categories/subcategories managed by the admin; districts and thanas from the geography tables).
 */
export interface KindDef { id: Extract<PostKind, 'story' | 'poem' | 'memory'>; label: string; subs: string[] }

export const KINDS: KindDef[] = [
  { id: 'story', label: 'গল্প', subs: ['ছোটগল্প', 'রহস্য ও রোমাঞ্চ', 'ভৌতিক', 'প্রেমের গল্প', 'শিশুতোষ', 'ধারাবাহিক উপন্যাস'] },
  { id: 'poem', label: 'কবিতা', subs: ['ছন্দের কবিতা', 'মুক্তছন্দ', 'ছড়া', 'গান ও গীতিকবিতা', 'অণুকবিতা'] },
  { id: 'memory', label: 'শৈশবের স্মৃতি', subs: ['গ্রামের দিনগুলো', 'স্কুলবেলা', 'উৎসব ও পার্বণ', 'খেলাধুলা', 'পরিবার ও আত্মীয়'] }
];

export const GEO: Record<string, string[]> = {
  'কুষ্টিয়া': ['কুমারখালী', 'খোকসা', 'মিরপুর', 'দৌলতপুর', 'ভেড়ামারা', 'কুষ্টিয়া সদর'],
  'ঢাকা': ['ধানমন্ডি', 'মিরপুর', 'মোহাম্মদপুর', 'সাভার', 'কেরানীগঞ্জ'],
  'চট্টগ্রাম': ['কোতোয়ালী', 'পটিয়া', 'হাটহাজারী', 'সীতাকুণ্ড'],
  'সিলেট': ['সিলেট সদর', 'বিয়ানীবাজার', 'জৈন্তাপুর', 'গোয়াইনঘাট'],
  'রাজশাহী': ['বোয়ালিয়া', 'পবা', 'বাঘা', 'চারঘাট'],
  'বরিশাল': ['কোতোয়ালী', 'বাকেরগঞ্জ', 'বানারীপাড়া', 'উজিরপুর']
};

export const SERIES = ['কোনো ধারাবাহিকের অংশ নয়', 'চরকান্দির গল্প — পর্ব ৩'];
export const AUDIENCES = ['সবার জন্য', 'শিশু-কিশোরদের জন্য', 'প্রাপ্তবয়স্কদের জন্য (১৮+)'];

/** Body fonts an author may pick (the same list the site loads). `id` is used in CSS as data-font. */
export const BODY_FONTS = [
  { id: 'tiro', label: 'তিরো বাংলা' },
  { id: 'noto', label: 'নোটো সেরিফ' },
  { id: 'hind', label: 'হিন্দ শিলিগুড়ি' },
  { id: 'baloo', label: 'বালু দা' },
  { id: 'anek', label: 'অনেক বাংলা' }
] as const;
export type BodyFontId = (typeof BODY_FONTS)[number]['id'];
export const BODY_SIZES = [16, 17, 18, 19, 20, 22, 24] as const;
