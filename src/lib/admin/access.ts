/** Shapes returned by the roles / team endpoints, plus the Bengali labels the screens use. */
export interface PermissionInfo { name: string; description: string }
export interface RoleInfo { id: string; name: string; description: string; isSystem: boolean; isActive: boolean; permissions: string[]; userCount: number }
export interface AccessOverview { roles: RoleInfo[]; permissions: PermissionInfo[] }
export interface StaffMember { id: string; username: string; displayName: string; email: string | null; roles: string[]; isActive: boolean; createdAtUtc: string; lastLoginAtUtc: string | null }
export interface StaffPage { items: StaffMember[]; total: number; page: number; pageSize: number }

export const SUPER_ADMIN = 'SuperAdmin';

export const ROLE_LABEL: Record<string, string> = {
  SuperAdmin: 'সুপার অ্যাডমিন', Editor: 'সম্পাদক', Reviewer: 'পর্যালোচক', ContentManager: 'কনটেন্ট ম্যানেজার', PolicyManager: 'নীতিমালা ব্যবস্থাপক',
  AdManager: 'বিজ্ঞাপন ব্যবস্থাপক', UserManager: 'ব্যবহারকারী ব্যবস্থাপক', Author: 'লেখক', TrustedAuthor: 'বিশ্বস্ত লেখক'
};
export const roleLabel = (name: string) => ROLE_LABEL[name] ?? name;

/** Permission name -> [label, hint]. Unknown names fall back to the API description. */
export const PERMISSION_LABEL: Record<string, [string, string]> = {
  'posts.create': ['লেখা তৈরি ও জমা', 'নিজের লেখা লেখা ও পর্যালোচনায় পাঠানো'],
  'posts.publish_direct': ['সরাসরি প্রকাশ', 'পর্যালোচনা ছাড়াই প্রকাশ (নীতিমালা যাচাই চলবে)'],
  'media.upload': ['ছবি ও ফাইল আপলোড', ''],
  'posts.review': ['জমা পড়া লেখা পর্যালোচনা', 'পর্যালোচনা সারি ও সুপারিশ'],
  'posts.edit_any': ['যেকোনো লেখা সম্পাদনা', 'প্রকাশিত লেখার সংশোধন'],
  'posts.unpublish': ['প্রকাশিত লেখা সরানো', 'আনপাবলিশ করা'],
  'posts.feature': ['ফিচার ও শীর্ষ লেখা', 'হোমপেজ স্লাইডার'],
  'posts.manage_all': ['সব লেখার তালিকা', 'পুরো সাইটের লেখা দেখা ও সাজানো'],
  'reports.handle': ['অভিযোগ নিষ্পত্তি', 'পাঠকের রিপোর্ট'],
  'categories.manage': ['ধরন ও উপধরন', 'নতুন বিভাগ যোগ'],
  'posttypes.manage': ['লেখার ধরন', 'গল্প, কবিতা, স্মৃতিকথা…'],
  'tags.manage': ['ট্যাগ', ''],
  'menus.manage': ['মেনু ও সাবমেনু', ''],
  'pages.manage': ['স্থির পাতা', 'আমাদের কথা, নীতিমালা…'],
  'geography.manage': ['ভৌগোলিক তথ্য', 'জেলা, থানা, ইউনিয়ন, গ্রাম'],
  'settings.manage': ['সাইট সেটিংস', 'থিম, লোগো, সামাজিক লিঙ্ক'],
  'policy.manage': ['নীতিমালা শব্দ তালিকা', 'শব্দ যোগ, তালিকা চালু/বন্ধ'],
  'ads.manage': ['বিজ্ঞাপন ও স্লট', ''],
  'ads.reports': ['বিজ্ঞাপন রিপোর্ট', ''],
  'users.read': ['ব্যবহারকারী দেখা', 'দলের তালিকা'],
  'users.manage': ['স্থগিত ও বিশ্বস্ত করা', 'অ্যাকাউন্ট স্থগিত, বিশ্বস্ত লেখক'],
  'users.reveal_pii': ['জন্মতারিখ ও মোবাইল দেখা', 'ব্যক্তিগত তথ্য'],
  'roles.manage': ['ভূমিকা ও অনুমতি', 'দল তৈরি ও ভূমিকা নির্ধারণ'],
  'stats.view': ['পরিসংখ্যান', ''],
  'audit.read': ['অডিট লগ', '']
};

export const PERMISSION_GROUPS: [string, string[]][] = [
  ['লেখা ও পর্যালোচনা', ['posts.create', 'posts.publish_direct', 'media.upload', 'posts.review', 'posts.edit_any', 'posts.unpublish', 'posts.feature', 'posts.manage_all', 'reports.handle']],
  ['সাইটের বিন্যাস', ['categories.manage', 'posttypes.manage', 'tags.manage', 'menus.manage', 'pages.manage', 'geography.manage', 'settings.manage']],
  ['নীতিমালা ও বিজ্ঞাপন', ['policy.manage', 'ads.manage', 'ads.reports']],
  ['ব্যবহারকারী ও নিরাপত্তা', ['users.read', 'users.manage', 'users.reveal_pii', 'roles.manage', 'stats.view', 'audit.read']]
];
