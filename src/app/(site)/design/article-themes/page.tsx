import { api } from '@/lib/api';
import { ArticleThemeLab } from '@/components/design/ArticleThemeLab';

export default async function ArticleThemesPage() {
  const post = await api.getPost('nodir-opare-ekta-lal-bari');
  return (
    <div className="l-wrap p-design">
      <h1 className="p-design__title">লেখার থিম</h1>
      <p className="p-design__lead">লেখক নিজের লেখার জন্য একটি থিম বেছে নেবেন। নিচের যেকোনোটিতে ক্লিক করলে নমুনা লেখা সেই থিমে দেখা যাবে।</p>
      <ArticleThemeLab sample={post?.bodyHtml ?? ''} />
    </div>
  );
}
