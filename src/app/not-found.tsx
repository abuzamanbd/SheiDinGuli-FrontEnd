import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="l-wrap l-wrap--narrow p-design">
      <h1 className="p-design__title">পাতাটি পাওয়া যায়নি</h1>
      <p className="p-design__lead">এই ঠিকানায় এখনো কিছু নেই। হয়তো পাতাটি এখনো তৈরি হয়নি।</p>
      <p><Link href="/" className="c-btn">হোমে ফিরুন</Link></p>
    </div>
  );
}
