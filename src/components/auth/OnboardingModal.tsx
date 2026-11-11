'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { bff } from '@/lib/bff';
import { toBn } from '@/lib/bn';
import { GEO_BD } from '@/lib/geo-bd';
import type { SessionUser } from '@/lib/auth/types';
import { Icon } from '../Icon';

const MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const GENDERS: [string, string][] = [['female', 'নারী'], ['male', 'পুরুষ'], ['other', 'অন্যান্য'], ['none', 'বলতে চাই না']];
const BN_TO_EN = (s: string) => s.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
export const LATER_KEY = 'sdg_onboarding_later';
const MIN_AGE = 13;

export interface ProfileValues {
  day: string; month: string; year: string; phone: string; gender: string;
  division: string; district: string; thana: string; village: string; visibility: 'district' | 'division' | 'hidden';
}

const firstDistrict = (div: string) => Object.keys(GEO_BD[div] ?? {})[0] ?? '';
export const emptyProfile = (): ProfileValues => {
  const division = Object.keys(GEO_BD)[0];
  const district = firstDistrict(division);
  return { day: '', month: '', year: '', phone: '', gender: '', division, district, thana: GEO_BD[division][district][0], village: '', visibility: 'district' };
};

/** Converts the form to what the API expects, or returns the first problem in Bengali. */
export function toPayload(v: ProfileValues): { error: string } | { payload: Record<string, unknown> } {
  if (!v.day || !v.month || !v.year) return { error: 'জন্মতারিখ বেছে নিন।' };
  const dob = new Date(Date.UTC(+v.year, +v.month - 1, +v.day));
  if (dob.getUTCMonth() !== +v.month - 1) return { error: 'জন্মতারিখটি সঠিক নয়।' };
  const cutoff = new Date(); cutoff.setUTCFullYear(cutoff.getUTCFullYear() - MIN_AGE);
  if (dob > cutoff) return { error: `লেখক হতে বয়স কমপক্ষে ${toBn(MIN_AGE)} বছর হতে হবে।` };
  const digits = BN_TO_EN(v.phone).replace(/\D/g, '').replace(/^880/, '').replace(/^0/, '');
  if (!/^1[3-9]\d{8}$/.test(digits)) return { error: 'মোবাইল নম্বরটি সঠিক নয় (যেমন: ১৭১২-৩৪৫৬৭৮)।' };
  return {
    payload: {
      mobile: `+880${digits}`,
      dateOfBirth: `${v.year}-${v.month.padStart(2, '0')}-${v.day.padStart(2, '0')}`,
      gender: v.gender || null, division: v.division, district: v.district, thana: v.thana,
      village: v.village.trim() || null, hometownVisibility: v.visibility
    }
  };
}

const Select = ({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) => (
  <>
    <label className="u-sr-only" htmlFor={id}>{label}</label>
    <select id={id} className="c-select" value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
  </>
);

/** Step 1 fields: date of birth, mobile, gender. Reused by the profile page. */
export function PersonalFields({ v, set }: { v: ProfileValues; set: (p: Partial<ProfileValues>) => void }) {
  const years = useMemo(() => { const y = new Date().getFullYear() - MIN_AGE; return Array.from({ length: y - 1939 }, (_, i) => y - i); }, []);
  return (
    <>
      <fieldset className="c-ob__group">
        <legend>জন্মতারিখ <b>*</b></legend>
        <div className="c-ob__dob">
          <Select id="ob-day" label="দিন" value={v.day} onChange={(day) => set({ day })}>
            <option value="">দিন</option>{Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{toBn(i + 1)}</option>)}
          </Select>
          <Select id="ob-month" label="মাস" value={v.month} onChange={(month) => set({ month })}>
            <option value="">মাস</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </Select>
          <Select id="ob-year" label="বছর" value={v.year} onChange={(year) => set({ year })}>
            <option value="">বছর</option>{years.map((y) => <option key={y} value={y}>{toBn(y)}</option>)}
          </Select>
        </div>
        <span className="c-ob__hint">লেখক হতে বয়স কমপক্ষে {toBn(MIN_AGE)} বছর হতে হবে।</span>
      </fieldset>

      <div className="c-ob__group">
        <label htmlFor="ob-phone" className="c-ob__legend">মোবাইল নম্বর <b>*</b></label>
        <div className="c-ob__phone">
          <span className="c-ob__code"><span className="c-ob__flag" aria-hidden="true" />+৮৮০</span>
          <input id="ob-phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="১XXX-XXXXXX" value={v.phone} onChange={(e) => set({ phone: e.target.value })} />
        </div>
        <span className="c-ob__hint">নম্বরটি আপনার প্রোফাইলে কেউ দেখবে না।</span>
      </div>

      <fieldset className="c-ob__group">
        <legend>লিঙ্গ <i>(ঐচ্ছিক)</i></legend>
        <div className="c-ob__chips" role="radiogroup">
          {GENDERS.map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={v.gender === id} className={`c-chip${v.gender === id ? ' is-on' : ''}`} onClick={() => set({ gender: id })}>{label}</button>
          ))}
        </div>
      </fieldset>
    </>
  );
}

/** Step 2 fields: hometown and how much of it is public. Reused by the profile page. */
export function AddressFields({ v, set }: { v: ProfileValues; set: (p: Partial<ProfileValues>) => void }) {
  const districts = Object.keys(GEO_BD[v.division] ?? {});
  const thanas = GEO_BD[v.division]?.[v.district] ?? [];
  const line = [v.village.trim(), v.thana, v.district, `${v.division} বিভাগ`].filter(Boolean).join(', ');
  const privacy: [ProfileValues['visibility'], string, string][] = [
    ['district', 'শুধু জেলা', `(যেমন: ${v.district})`], ['division', 'শুধু বিভাগ', `(যেমন: ${v.division})`], ['hidden', 'কিছুই দেখাবে না', '']
  ];
  return (
    <>
      <div className="c-ob__grid">
        <div><label htmlFor="ob-div" className="c-ob__legend">বিভাগ <b>*</b></label>
          <Select id="ob-div" label="বিভাগ" value={v.division} onChange={(division) => { const d = firstDistrict(division); set({ division, district: d, thana: GEO_BD[division][d][0] }); }}>
            {Object.keys(GEO_BD).map((d) => <option key={d}>{d}</option>)}
          </Select></div>
        <div><label htmlFor="ob-dist" className="c-ob__legend">জেলা <b>*</b></label>
          <Select id="ob-dist" label="জেলা" value={v.district} onChange={(district) => set({ district, thana: GEO_BD[v.division][district][0] })}>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </Select></div>
        <div><label htmlFor="ob-thana" className="c-ob__legend">থানা / উপজেলা <b>*</b></label>
          <Select id="ob-thana" label="থানা" value={v.thana} onChange={(thana) => set({ thana })}>
            {thanas.map((d) => <option key={d}>{d}</option>)}
          </Select></div>
        <div><label htmlFor="ob-village" className="c-ob__legend">গ্রাম / মহল্লা</label>
          <input id="ob-village" className="c-input" maxLength={100} placeholder="গ্রাম বা মহল্লার নাম" value={v.village} onChange={(e) => set({ village: e.target.value })} /></div>
      </div>
      <div className="c-ob__address"><Icon name="pin" width={18} height={18} /><b>{line}</b></div>
      <fieldset className="c-ob__privacy">
        <legend>প্রোফাইলে কতটুকু দেখাবে</legend>
        <div role="radiogroup">
          {privacy.map(([id, label, example]) => (
            <button key={id} type="button" role="radio" aria-checked={v.visibility === id} className={`c-radio${v.visibility === id ? ' is-on' : ''}`} onClick={() => set({ visibility: id })}>
              <span className="c-radio__ring"><span /></span><span>{label} <em>{example}</em></span>
            </button>
          ))}
        </div>
      </fieldset>
    </>
  );
}

/** The first-time modal shown after sign-up (design: "Onboarding modal"). */
export function OnboardingModal({ user, onClose }: { user: SessionUser; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [v, setV] = useState<ProfileValues>(emptyProfile);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<ProfileValues>) => setV((cur) => ({ ...cur, ...p }));
  const first = user.displayName.split(' ')[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && later();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('u-no-scroll');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('u-no-scroll'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function later() {
    try { sessionStorage.setItem(LATER_KEY, '1'); } catch { /* private mode */ }
    onClose();
  }

  function next() {
    setError(null);
    if (step === 1) {
      const r = toPayload(v);
      if ('error' in r) return setError(r.error);
      return setStep(2);
    }
    void save();
  }

  async function save() {
    const r = toPayload(v);
    if ('error' in r) { setStep(1); return setError(r.error); }
    setBusy(true);
    const res = await bff('POST', 'users/me/onboarding', r.payload);
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setStep(3);
    router.refresh();
  }

  const stepLabels = ['ব্যক্তিগত তথ্য', 'ঠিকানা', 'সম্পন্ন'];
  const heading = step === 1 ? 'আপনার সম্পর্কে একটু বলুন' : step === 2 ? 'আপনি কোথায় থাকেন?' : 'ধন্যবাদ!';
  const sub = step === 1 ? 'এই তথ্যগুলো অ্যাকাউন্টের নিরাপত্তা আর বয়স যাচাইয়ে কাজে লাগবে।'
    : step === 2 ? 'এলাকাভিত্তিক লেখা খুঁজে পেতে আর পাঠকদের সঙ্গে পরিচয়ে সাহায্য করবে।' : 'প্রোফাইল সম্পূর্ণ হয়েছে।';

  return (
    <div className="c-modal" role="presentation">
      <div className="c-ob" role="dialog" aria-modal="true" aria-labelledby="ob-title">
        <div className="c-ob__head">
          <span className="c-ob__blob" aria-hidden="true" />
          {step !== 3 && <button type="button" className="c-ob__close" aria-label="বন্ধ করুন" onClick={later}><Icon name="close" width={18} height={18} /></button>}
          <div className="c-ob__titles">
            <span className="c-ob__welcome">স্বাগতম, {first}!</span>
            <h2 id="ob-title">{heading}</h2>
            <p>{sub}</p>
          </div>
          <ol className="c-ob__steps" aria-label="ধাপ">
            {stepLabels.map((l, i) => (
              <li key={l} aria-current={i + 1 === step ? 'step' : undefined} className={i + 1 < step ? 'is-past' : i + 1 === step ? 'is-now' : ''}>
                <span className="c-ob__bar" /><span>{toBn(i + 1)}. {l}</span>
              </li>
            ))}
          </ol>
        </div>

        {step === 1 && <div className="c-ob__body"><PersonalFields v={v} set={set} /></div>}
        {step === 2 && <div className="c-ob__body"><AddressFields v={v} set={set} /></div>}
        {step === 3 && (
          <div className="c-ob__done">
            <span className="c-ob__tick"><Icon name="check" width={40} height={40} /></span>
            <h3>সব প্রস্তুত!</h3>
            <p>আপনার প্রোফাইল তৈরি হয়েছে। এখন প্রথম গল্প, কবিতা বা শৈশবের স্মৃতিটি লিখে ফেলুন।</p>
            <div className="c-ob__actions">
              <Link href="/write" className="c-btn" onClick={onClose}><Icon name="pen" width={17} height={17} />প্রথম লেখা শুরু করুন</Link>
              <Link href="/panel" className="c-btn c-btn--ghost" onClick={onClose}>লেখক প্যানেলে যান</Link>
            </div>
          </div>
        )}

        {step !== 3 && (
          <div className="c-ob__foot">
            {error && <p className="c-ob__error" role="alert">{error}</p>}
            <div className="c-ob__footrow">
              {step === 2 && <button type="button" className="c-btn c-btn--ghost" onClick={() => setStep(1)}>← আগের ধাপ</button>}
              {step === 1 && <button type="button" className="c-ob__later" onClick={later}>পরে করব</button>}
              <button type="button" className="c-btn c-ob__next" disabled={busy} onClick={next}>{busy ? 'সংরক্ষণ হচ্ছে…' : step === 1 ? 'পরের ধাপ →' : 'সংরক্ষণ করুন'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
