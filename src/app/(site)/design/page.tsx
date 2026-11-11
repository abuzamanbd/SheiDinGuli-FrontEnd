import Link from 'next/link';

export default function DesignIndex() {
  return (
    <div className="l-wrap p-design">
      <h1 className="p-design__title">ডিজাইন ল্যাব</h1>
      <p className="p-design__lead">এখানে ডিজাইন সিস্টেমের নমুনা দেখা যায়। পরে এগুলোই অ্যাডমিন প্যানেলের অংশ হবে।</p>
      <div className="p-design__grid">
        <Link href="/" className="p-design__card"><strong>হোম — ম্যাগাজিন</strong><span>ডিজাইন B (ডিফল্ট)</span></Link>
        <Link href="/?layout=classic" className="p-design__card"><strong>হোম — ক্লাসিক</strong><span>ডিজাইন A (বিকল্প লেআউট)</span></Link>
        <Link href="/design/theme-lab" className="p-design__card"><strong>থিম ল্যাব</strong><span>রং, ফন্ট, মেনুর রং বদলে দেখুন</span></Link>
        <Link href="/design/article-themes" className="p-design__card"><strong>লেখার থিম</strong><span>লেখক যেসব থিম বেছে নিতে পারবেন</span></Link>
        <Link href="/post/nodir-opare-ekta-lal-bari" className="p-design__card"><strong>লেখার পাতা</strong><span>গল্প (ক্লাসিক থিম)</span></Link>
        <Link href="/author/tanjila_r" className="p-design__card"><strong>লেখকের পাতা</strong><span>প্রোফাইল ও লেখার তালিকা</span></Link>
      </div>
    </div>
  );
}
