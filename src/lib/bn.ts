const DIGITS = '০১২৩৪৫৬৭৮৯';

/** 123 -> ১২৩ */
export const toBn = (value: number | string): string => String(value).replace(/\d/g, (d) => DIGITS[Number(d)]);

const numberFormat = new Intl.NumberFormat('bn-BD');

/** 12345 -> ১২,৩৪৫ */
export const formatCount = (n: number): string => numberFormat.format(n);

/** Short count for cards: 1250 -> ১.২ হাজার */
export const formatCountShort = (n: number): string => {
  if (n >= 100000) return `${toBn((n / 100000).toFixed(1).replace('.0', ''))} লক্ষ`;
  if (n >= 1000) return `${toBn((n / 1000).toFixed(1).replace('.0', ''))} হাজার`;
  return toBn(n);
};

export function timeAgoBn(iso: string, nowMs: number = Date.now()): string {
  const diff = Math.max(0, nowMs - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'এইমাত্র';
  if (minutes < 60) return `${toBn(minutes)} মিনিট আগে`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toBn(hours)} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'গতকাল';
  if (days < 30) return `${toBn(days)} দিন আগে`;
  return formatDateBn(iso);
}

export function formatDateBn(iso: string): string {
  return new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' }).format(new Date(iso));
}

export function formatShortDateBn(iso: string): string {
  return new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', timeZone: 'Asia/Dhaka' }).format(new Date(iso));
}

// ---- Bangla calendar (Bangladesh revised calendar)

const BANGLA_MONTHS = [
  // [name, gregorian month (1-12), gregorian start day]
  ['বৈশাখ', 4, 14], ['জ্যৈষ্ঠ', 5, 15], ['আষাঢ়', 6, 15], ['শ্রাবণ', 7, 16], ['ভাদ্র', 8, 16], ['আশ্বিন', 9, 16],
  ['কার্তিক', 10, 16], ['অগ্রহায়ণ', 11, 15], ['পৌষ', 12, 15], ['মাঘ', 1, 14], ['ফাল্গুন', 2, 13], ['চৈত্র', 3, 15]
] as const;

function dhakaParts(date: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

/** "২৭ কার্তিক ১৪৩৩" */
export function banglaDate(date: Date): string {
  const { y, m, d } = dhakaParts(date);
  const day = Date.UTC(y, m - 1, d);

  // The Bangla month that started most recently on or before today.
  let best = { index: 0, start: 0 };
  BANGLA_MONTHS.forEach(([, month, startDay], index) => {
    let startYear = y;
    if (month > m || (month === m && startDay > d)) startYear = y - 1;
    const start = Date.UTC(startYear, month - 1, startDay);
    if (start <= day && start > best.start) best = { index, start };
  });

  const dayOfMonth = Math.round((day - best.start) / 86400000) + 1;
  const banglaYear = day >= Date.UTC(y, 3, 14) ? y - 593 : y - 594;
  return `${toBn(dayOfMonth)} ${BANGLA_MONTHS[best.index][0]} ${toBn(banglaYear)}`;
}

/** "বুধবার, ১১ নভেম্বর ২০২৬" */
export function todayLongBn(date: Date): string {
  return new Intl.DateTimeFormat('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' }).format(date);
}

const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });

/** First letter of a name, keeping Bengali conjuncts and vowel signs together. */
export function initialOf(name: string): string {
  const first = segmenter.segment(name.trim())[Symbol.iterator]().next();
  return first.done ? '' : first.value.segment;
}
