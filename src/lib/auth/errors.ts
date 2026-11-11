import type { AuthFormError } from './types';

interface Problem { title?: string; detail?: string; errors?: Record<string, string[]> }

const FIELD_MESSAGES: Record<string, string> = {
  firstname: 'নামের প্রথম অংশ লিখুন (সর্বোচ্চ ৬০ অক্ষর)',
  lastname: 'নামের শেষ অংশ লিখুন (সর্বোচ্চ ৬০ অক্ষর)',
  username: 'ইউজারনেম ৩–৩০ অক্ষরের হতে হবে; ইংরেজি অক্ষর, সংখ্যা, ডট বা _ চলবে',
  password: 'পাসওয়ার্ড ৮ থেকে ১২৮ অক্ষরের হতে হবে',
  identifier: 'ইউজারনেম লিখুন'
};
const FORM_FIELD: Record<string, string> = { firstname: 'first', lastname: 'last', username: 'username', password: 'password', identifier: 'username' };

/** Turns an API failure into a Bengali message the form can show. */
export function toFormError(status: number, problem: Problem | null): AuthFormError {
  switch (status) {
    case 0: return { message: 'সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।' };
    case 400: {
      const fields: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(problem?.errors ?? {})) {
        const k = key.toLowerCase();
        const target = FORM_FIELD[k];
        if (!target) continue;
        fields[target] = k === 'username' && msgs.some((m) => /not available/i.test(m)) ? 'এই ইউজারনেমটি ব্যবহার করা যাবে না' : FIELD_MESSAGES[k] ?? msgs[0];
      }
      return { message: 'ফর্মের তথ্য ঠিক করুন।', fields };
    }
    case 401: {
      if (/not active/i.test(problem?.detail ?? '')) return { message: 'এই অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয়।' };
      if (/too many/i.test(problem?.detail ?? '')) return { message: 'অনেকবার ভুল হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।' };
      return { message: 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।' };
    }
    case 409: return { message: 'এই ইউজারনেমটি আগেই নেওয়া হয়েছে।', fields: { username: 'অন্য একটি ইউজারনেম বেছে নিন' } };
    case 422: return { message: 'অনুরোধটি সম্পন্ন করা যায়নি। সাইটের অ্যাডমিনকে জানান।' };
    case 429: return { message: 'অনেকবার চেষ্টা হয়েছে। এক মিনিট পরে আবার চেষ্টা করুন।' };
    default: return { message: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
  }
}
