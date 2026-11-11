import { api } from '@/lib/api';
import { ThemeLab } from '@/components/design/ThemeLab';

export default async function ThemeLabPage() {
  const [presets, posts] = await Promise.all([api.getThemes(), api.getPostsForSource({ mode: 'latest' }, 14)]);
  return (
    <div className="l-wrap p-design">
      <h1 className="p-design__title">থিম ল্যাব</h1>
      <p className="p-design__lead">বাম পাশে রং/ফন্ট বদলান, ডান পাশে সঙ্গে সঙ্গে ফল দেখুন। এটি অ্যাডমিন থিম এডিটরের নমুনা — এখানকার পরিবর্তন সংরক্ষিত হয় না।</p>
      <ThemeLab presets={presets} posts={posts} />
    </div>
  );
}
