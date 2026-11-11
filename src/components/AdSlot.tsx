const SHOW = process.env.NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS === 'true';

type Shape = 'banner' | 'box' | 'tall' | 'inline';
const SIZES: Record<Shape, string> = { banner: '৭২৮ × ৯০', box: '৩০০ × ২৫০', tall: '৩০০ × ৬০০', inline: 'ইন-আর্টিকেল' };

/** Marks a place for an advertisement. `slot` is the unique id the ad system will use later. */
export function AdSlot({ slot, shape = 'banner' }: { slot: string; shape?: Shape }) {
  if (!SHOW) return <div data-ad-slot={slot} />;
  return (
    <div className={`c-ad c-ad--${shape}`} data-ad-slot={slot} role="complementary" aria-label="বিজ্ঞাপন">
      <span className="c-ad__label">বিজ্ঞাপন</span>
      <span className="c-ad__size">{SIZES[shape]} · {slot}</span>
    </div>
  );
}
