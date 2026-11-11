import type {
  AuthorData, HomeConfig, MenuNode, PostCardData, PostFullData, PostKind, SectionSource, SiteSettings
} from '@/lib/types';
import { THEME_PRESETS } from '@/lib/theme/presets';
import type { SiteApi } from './types';

const MIN = 60_000;
const ago = (minutes: number) => new Date(Date.now() - minutes * MIN).toISOString();

const KIND_LABEL: Record<PostKind, string> = { story: 'গল্প', poem: 'কবিতা', memory: 'স্মৃতি', essay: 'প্রবন্ধ', other: 'অন্যান্য' };

type Seed = Omit<PostCardData, 'kindLabel' | 'readMinutes'> & { read: number };

const seeds: Seed[] = [
  { id: '1', slug: 'nodir-opare-ekta-lal-bari', title: 'নদীর ওপারে একটা লাল বাড়ি', kind: 'story', categoryName: 'ছোটগল্প', authorName: 'তানজিলা রহমান', authorUsername: 'tanjila_r', publishedAt: ago(1500), read: 7, views: 4820, likes: 312,
    excerpt: 'প্রতি সন্ধ্যায় মা বলতেন, ওই বাড়িতে কেউ থাকে না। অথচ আমি স্পষ্ট দেখতাম, জানালায় একটা হারিকেন জ্বলছে, আর কেউ যেন অপেক্ষা করছে নৌকার জন্য।' },
  { id: '2', slug: 'shrabboner-raat', title: 'শ্রাবণের রাত', kind: 'poem', categoryName: 'মুক্তছন্দ', authorName: 'সুমাইয়া আক্তার', authorUsername: 'sumaiya_a', publishedAt: ago(2900), read: 2, views: 2150, likes: 288,
    excerpt: 'জানালার কাচে বৃষ্টি লেখে নাম, অন্ধকারে জ্বলে একলা প্রদীপ।', poemLines: 'জানালার কাচে বৃষ্টি লেখে নাম,\nঅন্ধকারে জ্বলে একলা প্রদীপ—\nতোমার কথা ভাবি, আর ভাবি\nকত দূরে আছে ভোরের দ্বীপ।' },
  { id: '3', slug: 'dadubarir-amgach', title: 'দাদুবাড়ির আমগাছ', kind: 'memory', categoryName: 'গ্রামের দিনগুলো', authorName: 'ফারহানা ইয়াসমিন', authorUsername: 'farhana_y', publishedAt: ago(4400), read: 5, views: 3300, likes: 402,
    excerpt: 'গ্রীষ্মের ছুটিতে দাদুবাড়ির উঠোনের আমগাছটাই ছিল আমাদের রাজ্য। কালবৈশাখীর পর কুড়োনো কাঁচা আমের স্বাদ আজও মুখে লেগে আছে।' },
  { id: '4', slug: 'shesh-trainer-jatri', title: 'শেষ ট্রেনের যাত্রী', kind: 'story', categoryName: 'রহস্য ও রোমাঞ্চ', authorName: 'অর্ণব সেনগুপ্ত', authorUsername: 'arnab_s', publishedAt: ago(60), read: 8, views: 6100, likes: 520,
    excerpt: 'কমলাপুর স্টেশনের শেষ ট্রেনে উঠেছিল মাত্র তিনজন যাত্রী। তাদের একজন জানত, এই রাতটা আর সাধারণ থাকবে না।' },
  { id: '5', slug: 'brishtibheja-chithi', title: 'বৃষ্টিভেজা চিঠি', kind: 'story', categoryName: 'প্রেমের গল্প', authorName: 'নুসরাত জাহান', authorUsername: 'nusrat_j', publishedAt: ago(300), read: 6, views: 2740, likes: 190,
    excerpt: 'পুরোনো ট্রাঙ্কের তলায় পাওয়া চিঠিটার কালি বৃষ্টিতে ধুয়ে গেছে, শুধু শেষ লাইনটা এখনো পড়া যায়।' },
  { id: '6', slug: 'majhir-gaan', title: 'মাঝির গান', kind: 'story', categoryName: 'ছোটগল্প', authorName: 'রফিকুল ইসলাম', authorUsername: 'rafiq_i', publishedAt: ago(5800), read: 9, views: 1880, likes: 121,
    excerpt: 'ভাটিয়ালি সুরে মাঝি যে গান গাইত, তার প্রতিটি কথায় লুকিয়ে ছিল একটা হারানো গ্রামের নাম।' },
  { id: '7', slug: 'mayer-haat', title: 'মায়ের হাত', kind: 'poem', categoryName: 'জীবন ও দর্শন', authorName: 'মাহমুদ হাসান', authorUsername: 'mahmud_h', publishedAt: ago(7200), read: 2, views: 5200, likes: 640,
    excerpt: 'মায়ের হাতে ভাতের গন্ধ লেগে থাকে, শীতের সকালে রোদের মতো উষ্ণ।', poemLines: 'মায়ের হাতে ভাতের গন্ধ লেগে থাকে,\nশীতের সকালে রোদের মতো উষ্ণ;\nসব পথ ঘুরে ফিরে আসি শেষে\nসেই হাতের ছায়ায়, শান্ত, পূর্ণ।' },
  { id: '8', slug: 'shohorer-pakhi', title: 'শহরের পাখি', kind: 'poem', categoryName: 'প্রকৃতি ও ঋতু', authorName: 'দেবাশীষ পাল', authorUsername: 'debashish_p', publishedAt: ago(15), read: 2, views: 980, likes: 76,
    excerpt: 'ইটের দেয়ালে বাসা বাঁধে চড়ুই, তারের ওপরে বসে গান গায় ভোরে।', poemLines: 'ইটের দেয়ালে বাসা বাঁধে চড়ুই,\nতারের ওপরে বসে গান গায় ভোরে;\nআমরা যারা গ্রাম ছেড়ে এসেছি,\nতারাও কি গান খুঁজি এমন করে?' },
  { id: '9', slug: 'prothom-ghuri-katar-din', title: 'প্রথম ঘুড়ি কাটার দিন', kind: 'memory', categoryName: 'খেলাধুলা', authorName: 'সাকিব হোসেন', authorUsername: 'sakib_h', publishedAt: ago(8600), read: 4, views: 4100, likes: 355,
    excerpt: 'পৌষ সংক্রান্তির বিকেলে ছাদ থেকে প্রথমবার পাশের বাড়ির ঘুড়ি কেটেছিলাম। সেদিন নিজেকে পৃথিবীর সবচেয়ে বড় বীর মনে হয়েছিল।' },
  { id: '10', slug: 'schooler-tiffin-baksho', title: 'স্কুলের টিফিন বাক্স', kind: 'memory', categoryName: 'স্কুলবেলা', authorName: 'রুমানা চৌধুরী', authorUsername: 'rumana_c', publishedAt: ago(180), read: 5, views: 2210, likes: 240,
    excerpt: 'স্টিলের সেই গোল টিফিন বাক্সে মা রোজ দিতেন পরোটা আর আলুভাজি। টিফিনের ঘণ্টা বাজার আগেই অর্ধেকটা শেষ হয়ে যেত।' },
  { id: '11', slug: 'choitrer-melay-hariye-jaoya', title: 'চৈত্রের মেলায় হারিয়ে যাওয়া', kind: 'memory', categoryName: 'উৎসব ও পার্বণ', authorName: 'ইমরান কবির', authorUsername: 'imran_k', publishedAt: ago(1900), read: 4, views: 1560, likes: 133,
    excerpt: 'বাবার হাত ছেড়ে নাগরদোলার দিকে ছুটেছিলাম। তারপর চারপাশে শুধু অচেনা মুখ, আর দূরে কোথাও বাঁশির শব্দ।' },
  { id: '12', slug: 'kuyashar-bhore-phera', title: 'কুয়াশার ভোরে ফেরা', kind: 'story', categoryName: 'ছোটগল্প', authorName: 'তানজিলা রহমান', authorUsername: 'tanjila_r', publishedAt: ago(9900), read: 6, views: 1320, likes: 98,
    excerpt: 'শীতের কুয়াশায় ঢাকা স্টেশনে নেমে বুঝলাম, বিশ বছরে এই গ্রামের কিছুই বদলায়নি—শুধু আমি ছাড়া।' },
  { id: '13', slug: 'nanir-paner-bata', title: 'নানির পানের বাটা', kind: 'memory', categoryName: 'পরিবার ও আত্মীয়', authorName: 'তানজিলা রহমান', authorUsername: 'tanjila_r', publishedAt: ago(12000), read: 4, views: 870, likes: 77,
    excerpt: 'নানির পানের বাটাটা ছিল এক গোপন ভাণ্ডার—এলাচ, লবঙ্গ আর পুরোনো দিনের গন্ধে ভরা।' },
  { id: '14', slug: 'ek-tukro-megh', title: 'এক টুকরো মেঘ', kind: 'poem', categoryName: 'ছড়া', authorName: 'তানজিলা রহমান', authorUsername: 'tanjila_r', publishedAt: ago(14500), read: 1, views: 640, likes: 61,
    excerpt: 'এক টুকরো মেঘ এসে বসল আমার ছাদে।', poemLines: 'এক টুকরো মেঘ এসে বসল আমার ছাদে,\nবলল, “একটু জিরোই, বড্ড পথ হাঁটা”—\nআমি দিলাম জল, সে দিল বৃষ্টি,\nএভাবেই শুরু হলো আমাদের আটা-বাটা।' }
];

const posts: PostCardData[] = seeds.map(({ read, ...p }) => ({ ...p, kindLabel: KIND_LABEL[p.kind], readMinutes: read }));

const bySlug = (slug: string) => posts.find((p) => p.slug === slug);

const BODY_STORY = [
  'আমাদের গ্রামের শেষ মাথায় নদীটা বাঁক নিয়েছে যেখানে, ঠিক সেখানেই ওপারে দাঁড়িয়ে ছিল লাল রঙের একটা দোতলা বাড়ি। দূর থেকে দেখলে মনে হতো, কেউ যেন সবুজ ক্যানভাসে এক ফোঁটা সিঁদুর ফেলে দিয়েছে।',
  'বিকেল হলেই আমরা ঘাটে গিয়ে বসতাম। ওপারের বাড়িটা তখন কমলা আলোয় জ্বলত। মা বলতেন, “ওদিকে তাকাস না, ওই বাড়িতে কেউ থাকে না।” কিন্তু যে কথা নিষেধ করা হয়, সেটাই তো সবচেয়ে বেশি টানে।',
  'সেই বছর বর্ষায় নদী ফুলে উঠল। এক সন্ধ্যায় আমি স্পষ্ট দেখলাম, দোতলার জানালায় একটা হারিকেন জ্বলছে। আলোটা একবার কাঁপল, তারপর যেন আমারই দিকে তাকিয়ে রইল।',
  'কুড়ি বছর পর আজ আবার সেই ঘাটে এসে দাঁড়িয়েছি। নদী আগের চেয়ে শীর্ণ, ঘাটের সিঁড়িটা অর্ধেক ভাঙা। কিন্তু ওপারের লাল বাড়িটা ঠিক আগের মতোই দাঁড়িয়ে আছে—আর জানালায় সেই আলো।',
  'আমি জেলেনৌকার এক বুড়ো মাঝিকে ডাকলাম। সে আমার মুখের দিকে অনেকক্ষণ তাকিয়ে থেকে বলল, “এতদিন লাগল, খোকা?” আমি বুঝলাম না। কিন্তু তখনই মনে হলো, এই প্রশ্নের উত্তর খুঁজতেই আমি এতদূর ফিরে এসেছি।'
];

function bodyHtmlFor(kind: PostKind, poem?: string): string {
  if (kind === 'poem' && poem) {
    const stanza = poem.split('\n').join('<br>');
    return `<p>${stanza}</p><p>${stanza}</p><p>${stanza}</p>`;
  }
  const paragraphs = BODY_STORY.map((p) => `<p>${p}</p>`);
  paragraphs.splice(3, 0, '<blockquote>“যে অপেক্ষা করে, সে-ই থাকে।”</blockquote>');
  return paragraphs.join('');
}

const THEME_FOR_KIND: Record<PostKind, PostFullData['articleTheme']> = {
  story: 'classic', poem: 'poetry', memory: 'nostalgia', essay: 'modern', other: 'modern'
};

const authors: AuthorData[] = [
  { username: 'tanjila_r', name: 'তানজিলা রহমান', roleLabel: 'গল্পকার', verified: true, location: 'ঢাকা, বাংলাদেশ', favouriteKinds: 'ছোটগল্প, স্মৃতিকথা', website: 'tanjila.example.com', joinedLabel: 'যোগ দিয়েছেন জানুয়ারি ২০২৫',
    bio: 'নদী, বর্ষা আর ফেলে আসা গ্রামের গল্প লিখি। দিনে স্কুলে পড়াই, রাতে গল্পের চরিত্রদের সঙ্গে কথা বলি।',
    longBio: 'জন্ম কুষ্টিয়ার এক নদীপাড়ের গ্রামে। ছোটবেলায় দাদির মুখে শোনা গল্পগুলোই লেখার প্রথম প্রেরণা। ২০২৫ সাল থেকে গল্পকথায় নিয়মিত লিখছি।',
    topics: ['নদী', 'বর্ষা', 'গ্রামবাংলা', 'পরিবার', 'রহস্য'], counts: { total: 4, story: 2, poem: 1, memory: 1 } },
  { username: 'mahmud_h', name: 'মাহমুদ হাসান', roleLabel: 'কবি', verified: true, bio: 'ছন্দে ও অছন্দে জীবনের কথা বলি।', joinedLabel: 'যোগ দিয়েছেন মার্চ ২০২৫', topics: ['জীবন', 'মা'], counts: { total: 1, story: 0, poem: 1, memory: 0 } },
  { username: 'farhana_y', name: 'ফারহানা ইয়াসমিন', roleLabel: 'স্মৃতিকথা লেখক', verified: false, bio: 'ফেলে আসা দিনের গল্প লিখি।', joinedLabel: 'যোগ দিয়েছেন মে ২০২৫', topics: ['গ্রাম', 'শৈশব'], counts: { total: 1, story: 0, poem: 0, memory: 1 } },
  { username: 'arnab_s', name: 'অর্ণব সেনগুপ্ত', roleLabel: 'গল্পকার', verified: false, bio: 'রহস্য আর রোমাঞ্চ আমার প্রিয়।', joinedLabel: 'যোগ দিয়েছেন জুন ২০২৫', topics: ['রহস্য', 'ভ্রমণ'], counts: { total: 1, story: 1, poem: 0, memory: 0 } },
  { username: 'sumaiya_a', name: 'সুমাইয়া আক্তার', roleLabel: 'কবি', verified: false, bio: 'বৃষ্টি, রাত আর একা প্রদীপের কবিতা।', joinedLabel: 'যোগ দিয়েছেন জুলাই ২০২৫', topics: ['বর্ষা', 'প্রেম'], counts: { total: 1, story: 0, poem: 1, memory: 0 } }
];

const settings: SiteSettings = {
  siteNameFirst: 'গল্প', siteNameAccent: 'কথা', tagline: 'বাংলায় লিখুন, বাংলায় পড়ুন', logoAlt: 'গল্পকথা',
  homeLayout: 'magazine',
  topBarEnabled: true,
  topBarLinks: [{ label: 'লেখার নির্দেশিকা', href: '/page/writing-guide' }, { label: 'সহায়তা', href: '/page/help' }],
  footerAbout: 'বাংলা ভাষায় গল্প, কবিতা আর শৈশবের স্মৃতি লেখা ও পড়ার একটি উন্মুক্ত আঙিনা।',
  footerGroups: [
    { heading: 'বিভাগ', links: [{ label: 'গল্প', href: '/category/golpo' }, { label: 'কবিতা', href: '/category/kobita' }, { label: 'শৈশবের স্মৃতি', href: '/category/smriti' }] },
    { heading: 'প্ল্যাটফর্ম', links: [{ label: 'আমাদের সম্পর্কে', href: '/page/about' }, { label: 'প্রকাশনা নীতিমালা', href: '/page/policy' }, { label: 'গোপনীয়তা নীতি', href: '/page/privacy' }] },
    { heading: 'সহায়তা', links: [{ label: 'প্রশ্নোত্তর', href: '/page/faq' }, { label: 'যোগাযোগ', href: '/page/contact' }, { label: 'অভিযোগ জানান', href: '/page/report' }] }
  ],
  copyright: '© ২০২৬ গল্পকথা। সর্বস্বত্ব সংরক্ষিত।',
  footerNote: 'মোবাইল অ্যাপ শীঘ্রই আসছে',
  defaultThemeId: 'default'
};

const L = (label: string, href = '#') => ({ label, href });

const menu: MenuNode[] = [
  { id: 'home', label: 'হোম', href: '/', type: 'link' },
  { id: 'golpo', label: 'গল্প', href: '/category/golpo', type: 'mega', mega: {
    tone: 'story', title: 'গল্প', description: 'ছোটগল্প, রহস্য, প্রেম আর জীবনের নানা রঙের গল্প — প্রতিদিন নতুন।', ctaLabel: 'সব গল্প',
    columns: [
      { heading: 'ধরন', links: [L('ছোটগল্প'), L('রহস্য ও রোমাঞ্চ'), L('ভৌতিক'), L('প্রেমের গল্প'), L('শিশুতোষ')] },
      { heading: 'সংগ্রহ', links: [L('সম্পাদকের পছন্দ'), L('সপ্তাহের সেরা'), L('নতুন লেখকের গল্প'), L('ধারাবাহিক উপন্যাস')] }],
    featured: { heading: 'নতুন গল্প', items: [
      { title: 'নদীর ওপারে একটা লাল বাড়ি', sub: 'তানজিলা রহমান', href: '/post/nodir-opare-ekta-lal-bari', shape: 'square', kind: 'story' },
      { title: 'শেষ ট্রেনের যাত্রী', sub: 'অর্ণব সেনগুপ্ত', href: '/post/shesh-trainer-jatri', shape: 'square', kind: 'story' },
      { title: 'মাঝির গান', sub: 'রফিকুল ইসলাম', href: '/post/majhir-gaan', shape: 'square', kind: 'story' }] } } },
  { id: 'kobita', label: 'কবিতা', href: '/category/kobita', type: 'mega', mega: {
    tone: 'poem', title: 'কবিতা', description: 'ছন্দে, অছন্দে, ছড়ায় আর গানে — মনের কথা কবিতায়।', ctaLabel: 'সব কবিতা',
    columns: [
      { heading: 'ধরন', links: [L('ছন্দের কবিতা'), L('মুক্তছন্দ'), L('ছড়া'), L('গান ও গীতিকবিতা'), L('অণুকবিতা')] },
      { heading: 'বিষয়', links: [L('প্রেম ও বিরহ'), L('প্রকৃতি ও ঋতু'), L('দেশ ও মাটি'), L('জীবন ও দর্শন')] }],
    featured: { heading: 'নতুন কবিতা', items: [
      { title: 'শ্রাবণের রাত', sub: 'সুমাইয়া আক্তার', href: '/post/shrabboner-raat', shape: 'square', kind: 'poem' },
      { title: 'মায়ের হাত', sub: 'মাহমুদ হাসান', href: '/post/mayer-haat', shape: 'square', kind: 'poem' },
      { title: 'শহরের পাখি', sub: 'দেবাশীষ পাল', href: '/post/shohorer-pakhi', shape: 'square', kind: 'poem' }] } } },
  { id: 'smriti', label: 'শৈশবের স্মৃতি', href: '/category/smriti', type: 'mega', mega: {
    tone: 'memory', title: 'শৈশবের স্মৃতি', description: 'ঘুড়ি, মেলা, টিফিন বাক্স — ফেলে আসা দিনের গল্প।', ctaLabel: 'সব স্মৃতিকথা',
    columns: [
      { heading: 'বিষয়', links: [L('গ্রামের দিনগুলো'), L('স্কুলবেলা'), L('উৎসব ও পার্বণ'), L('খেলাধুলা'), L('পরিবার ও আত্মীয়')] },
      { heading: 'সময়কাল', links: [L('সত্তরের দশক'), L('আশির দশক'), L('নব্বইয়ের দশক'), L('২০০০-এর পরে')] }],
    featured: { heading: 'নতুন স্মৃতিকথা', items: [
      { title: 'দাদুবাড়ির আমগাছ', sub: 'ফারহানা ইয়াসমিন', href: '/post/dadubarir-amgach', shape: 'square', kind: 'memory' },
      { title: 'প্রথম ঘুড়ি কাটার দিন', sub: 'সাকিব হোসেন', href: '/post/prothom-ghuri-katar-din', shape: 'square', kind: 'memory' },
      { title: 'স্কুলের টিফিন বাক্স', sub: 'রুমানা চৌধুরী', href: '/post/schooler-tiffin-baksho', shape: 'square', kind: 'memory' }] } } },
  { id: 'lekhok', label: 'লেখকগণ', href: '/author/tanjila_r', type: 'mega', mega: {
    tone: 'neutral', title: 'লেখকগণ', description: 'যাঁদের কলমে প্রাণ পায় গল্পকথা — তাঁদের সঙ্গে পরিচিত হোন।', ctaLabel: 'সব লেখক',
    columns: [
      { heading: 'লেখক', links: [L('সব লেখক'), L('নতুন লেখক'), L('মাসের সেরা লেখক'), L('লেখক হোন')] },
      { heading: 'সহায়তা', links: [L('লেখার নির্দেশিকা'), L('প্রকাশনা নীতিমালা'), L('পর্যালোচনা প্রক্রিয়া')] }],
    featured: { heading: 'জনপ্রিয় লেখক', items: [
      { title: 'তানজিলা রহমান', sub: 'গল্পকার', href: '/author/tanjila_r', shape: 'round', kind: 'story' },
      { title: 'মাহমুদ হাসান', sub: 'কবি', href: '/author/mahmud_h', shape: 'round', kind: 'poem' },
      { title: 'ফারহানা ইয়াসমিন', sub: 'স্মৃতিকথা লেখক', href: '/author/farhana_y', shape: 'round', kind: 'memory' }] } } },
  { id: 'more', label: 'আরও', href: '#', type: 'dropdown', links: [
    L('আমাদের সম্পর্কে', '/page/about'), L('প্রকাশনা নীতিমালা', '/page/policy'), L('প্রায়শই জিজ্ঞাসিত প্রশ্ন', '/page/faq'), L('যোগাযোগ', '/page/contact')] }
];

/** Every home block is listed here with a unique key. The admin turns blocks on/off and picks what they show. */
const homeConfig: HomeConfig = {
  layout: 'magazine',
  sections: [
    { key: 'home.ad.top', enabled: true },
    { key: 'home.hero.latest', enabled: true, title: 'সর্বশেষ', source: { mode: 'latest' }, count: 5 },
    { key: 'home.hero.slider', enabled: true, title: 'সম্পাদকের পছন্দ', source: { mode: 'manual', postIds: ['1', '2', '3'] }, count: 3 },
    { key: 'home.hero.top', enabled: true, title: 'শীর্ষ ৫', source: { mode: 'top', metric: 'views', period: 'week' }, count: 5, linkLabel: 'সব জনপ্রিয় লেখা', linkHref: '/top' },
    { key: 'home.categories', enabled: true, title: 'বিভাগ' },
    { key: 'home.stories', enabled: true, title: 'নির্বাচিত গল্প', subtitle: 'গল্প', source: { mode: 'postType', typeKey: 'story' }, count: 4, linkLabel: 'সব গল্প →', linkHref: '/category/golpo' },
    { key: 'home.poems', enabled: true, title: 'কবিতার পাতা', subtitle: 'কবিতা', source: { mode: 'postType', typeKey: 'poem' }, count: 3, linkLabel: 'সব কবিতা →', linkHref: '/category/kobita' },
    { key: 'home.memories', enabled: true, title: 'শৈশবের স্মৃতি', subtitle: 'স্মৃতিকথা', source: { mode: 'postType', typeKey: 'memory' }, count: 4, linkLabel: 'সব স্মৃতিকথা →', linkHref: '/category/smriti' },
    { key: 'home.sidebar.cta', enabled: true, title: 'প্রতিটি জীবনেই একটা গল্প আছে', body: 'আপনারটা লিখুন। প্রকাশের আগে আমাদের সম্পাদকেরা যত্ন নিয়ে পড়ে দেখবেন।', buttonLabel: 'লেখা শুরু করুন' },
    { key: 'home.sidebar.topics', enabled: true, title: 'বিষয়সমূহ' },
    { key: 'home.sidebar.ad', enabled: true },
    { key: 'home.authors', enabled: true, title: 'আমাদের লেখকেরা', count: 5, linkLabel: 'সব লেখক →', linkHref: '/author/tanjila_r' },
    { key: 'home.newsletter', enabled: true, title: 'সাপ্তাহিক বাছাই, আপনার ইনবক্সে', body: 'প্রতি শুক্রবার সপ্তাহের সেরা গল্প ও কবিতা।' }
  ]
};

const TOPICS = ['প্রেম', 'প্রকৃতি', 'গ্রামবাংলা', 'বর্ষা', 'মুক্তিযুদ্ধ', 'শহর', 'পরিবার', 'উৎসব', 'রহস্য', 'ভৌতিক', 'শিশুতোষ', 'ভ্রমণ'];


function pick(source: SectionSource, count: number): PostCardData[] {
  switch (source.mode) {
    case 'latest':
      return [...posts].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)).slice(0, count);
    case 'top': {
      // The sample data has no per-day stats, so shuffle the ranking a little per period to make the tabs visibly different.
      const rank = (p: PostCardData) => (source.metric === 'views' ? p.views : p.likes);
      const offset = { day: 3, week: 0, month: 1, all: 2 }[source.period];
      const sorted = [...posts].sort((a, b) => rank(b) - rank(a));
      return sorted.slice(offset).concat(sorted.slice(0, offset)).slice(0, count);
    }
    case 'postType':
      return posts.filter((p) => p.kind === source.typeKey).slice(0, count);
    case 'category':
      return posts.filter((p) => p.categoryName === source.categorySlug).slice(0, count);
    case 'manual':
      return source.postIds.map((id) => posts.find((p) => p.id === id)).filter((p): p is PostCardData => !!p).slice(0, count);
  }
}

export const mockApi: SiteApi = {
  async getSettings() { return settings; },
  async getThemes() { return THEME_PRESETS; },
  async getMenu() { return menu; },
  async getHomeConfig() { return homeConfig; },
  async getPostsForSource(source, count) { return pick(source, count); },

  async getPost(slug) {
    const base = bySlug(slug);
    if (!base) return null;
    const index = posts.indexOf(base);
    const prev = posts[(index + posts.length - 1) % posts.length];
    const next = posts[(index + 1) % posts.length];
    return {
      ...base,
      subtitle: base.kind === 'story' ? 'শৈশবের এক রহস্য, কুড়ি বছর পর যার উত্তর খুঁজতে ফিরে যাওয়া।' : undefined,
      bodyHtml: bodyHtmlFor(base.kind, base.poemLines),
      tags: ['নদী', 'গ্রামবাংলা', 'রহস্য', 'বর্ষা'],
      breadcrumbs: [{ label: 'হোম', href: '/' }, { label: base.kindLabel, href: '#' }, { label: base.categoryName }],
      articleTheme: THEME_FOR_KIND[base.kind],
      featured: base.id === '1',
      prev: { title: prev.title, slug: prev.slug },
      next: { title: next.title, slug: next.slug }
    };
  },

  async getRelatedPosts(slug, count) {
    return posts.filter((p) => p.slug !== slug).slice(0, count);
  },
  async getAuthor(username) { return authors.find((a) => a.username === username) ?? null; },
  async getAuthorPosts(username) { return posts.filter((p) => p.authorUsername === username); },
  async getTopics() { return TOPICS; },
  async getFeaturedAuthors(count) { return authors.slice(0, count); }
};

