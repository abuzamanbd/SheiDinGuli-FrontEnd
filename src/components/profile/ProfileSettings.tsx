'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { bff } from '@/lib/bff';
import { toBn } from '@/lib/bn';
import { GEO_BD } from '@/lib/geo-bd';
import { AddressFields, PersonalFields, emptyProfile, toPayload, type ProfileValues } from '../auth/OnboardingModal';
import { Icon } from '../Icon';

/** GET users/me/profile */
interface MyProfile {
  nickname: string | null; bio: string | null; email: string | null; mobile: string | null; dateOfBirth: string | null; gender: string | null;
  division: string | null; district: string | null; thana: string | null; village: string | null; hometownVisibility: string;
}

/** Turns what the API stores back into the form values (mobile without +880, date split in three). */
function toValues(p: MyProfile): ProfileValues {
  const base = emptyProfile();
  const [y, m, d] = (p.dateOfBirth ?? '').split('-');
  const division = p.division && GEO_BD[p.division] ? p.division : base.division;
  const district = p.district && GEO_BD[division]?.[p.district] ? p.district : Object.keys(GEO_BD[division])[0];
  const thana = p.thana && GEO_BD[division][district].includes(p.thana) ? p.thana : GEO_BD[division][district][0];
  const vis = p.hometownVisibility === 'division' || p.hometownVisibility === 'hidden' ? p.hometownVisibility : 'district';
  return {
    day: d ? String(+d) : '', month: m ? String(+m) : '', year: y ?? '',
    phone: (p.mobile ?? '').replace(/^\+?880/, ''), gender: p.gender ?? '',
    division, district, thana, village: p.village ?? '', visibility: vis
  };
}

/** Profile settings: the same fields as the onboarding form, plus nickname, bio and email. */
export function ProfileSettings({ displayName, username }: { displayName: string; username: string }) {
  const router = useRouter();
  const [v, setV] = useState<ProfileValues>(emptyProfile);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<ProfileValues>) => { setSaved(false); setV((cur) => ({ ...cur, ...p })); };

  useEffect(() => {
    void bff<MyProfile>('GET', 'users/me/profile').then((r) => {
      if (!r.ok || !r.data) return setError(r.ok ? 'প্রোফাইল পাওয়া যায়নি।' : r.message);
      const d = r.data;
      setV(toValues(d)); setNickname(d.nickname ?? ''); setBio(d.bio ?? ''); setEmail(d.email ?? '');
      setLoaded(true);
    });
  }, []);

  async function save() {
    setError(null); setSaved(false);
    const r = toPayload(v);
    if ('error' in r) return setError(r.error);
    setBusy(true);
    const res = await bff('PUT', 'users/me/profile', { ...r.payload, nickname: nickname.trim() || null, bio: bio.trim() || null, email: email.trim() || null });
    setBusy(false);
    if (!res.ok) return setError(res.fields ? Object.values(res.fields).join(' ') : res.message);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="p-profile">
      <header className="p-profile__top">
        <Link href="/panel" className="p-profile__back"><Icon name="chevron" width={14} height={14} />লেখক প্যানেল</Link>
        <Link href={`/author/${username}`} className="c-btn c-btn--ghost"><Icon name="eye" width={16} height={16} />প্রোফাইল দেখুন</Link>
      </header>
      <main className="p-profile__main">
        <h1>আমার প্রোফাইল</h1>
        <p className="p-profile__sub">{displayName} · @{username}</p>
        {!loaded && !error && <p className="p-profile__sub">লোড হচ্ছে…</p>}

        {loaded && (
          <>
            <section className="p-profile__card">
              <h2>পরিচিতি</h2>
              <div className="c-ob__group">
                <label htmlFor="pf-nick" className="c-ob__legend">ডাকনাম <i>(ঐচ্ছিক)</i></label>
                <input id="pf-nick" className="c-input" maxLength={60} value={nickname} onChange={(e) => { setSaved(false); setNickname(e.target.value); }} placeholder="লেখার সঙ্গে যে নামে পরিচিত হতে চান" />
              </div>
              <div className="c-ob__group">
                <label htmlFor="pf-bio" className="c-ob__legend">আপনার সম্পর্কে</label>
                <textarea id="pf-bio" className="c-textarea" rows={4} maxLength={500} value={bio} onChange={(e) => { setSaved(false); setBio(e.target.value); }} placeholder="পাঠকের জন্য দুই-তিন লাইন" />
                <span className="c-ob__hint">{toBn(bio.length)}/৫০০ · প্রোফাইলে সবাই দেখবে।</span>
              </div>
              <div className="c-ob__group">
                <label htmlFor="pf-mail" className="c-ob__legend">ইমেইল <i>(ঐচ্ছিক)</i></label>
                <input id="pf-mail" className="c-input" type="email" autoComplete="email" value={email} onChange={(e) => { setSaved(false); setEmail(e.target.value); }} />
                <span className="c-ob__hint">পাসওয়ার্ড পুনরুদ্ধারে কাজে লাগবে; প্রোফাইলে দেখানো হবে না।</span>
              </div>
            </section>
            <section className="p-profile__card"><h2>ব্যক্তিগত তথ্য</h2><PersonalFields v={v} set={set} /></section>
            <section className="p-profile__card"><h2>ঠিকানা</h2><AddressFields v={v} set={set} /></section>
          </>
        )}

        {error && <p className="c-ob__error" role="alert">{error}</p>}
        {saved && <p className="p-admin__ok" role="status">প্রোফাইল সংরক্ষণ হয়েছে।</p>}
        <div className="p-profile__foot">
          <button type="button" className="c-btn" disabled={busy || !loaded} onClick={save}>{busy ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</button>
        </div>
      </main>
    </div>
  );
}
