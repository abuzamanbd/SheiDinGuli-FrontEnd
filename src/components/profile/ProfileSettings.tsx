'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { bff } from '@/lib/bff';
import { toBn } from '@/lib/bn';
import { GEO_BD } from '@/lib/geo-bd';
import { AddressFields, PersonalFields, emptyProfile, toPayload, type ProfileValues } from '../auth/OnboardingModal';
import { Icon } from '../Icon';

type Tab = 'personal' | 'profile' | 'security' | 'notify';
interface Pref { email: boolean; sms: boolean }

/** GET users/me/settings */
interface Settings {
  firstName: string; lastName: string; username: string; nickname: string | null; identityLabel: string | null; website: string | null; topics: string[];
  bio: string | null; email: string | null; emailVerified: boolean; mobile: string | null; mobileVerified: boolean; dateOfBirth: string | null; gender: string | null;
  division: string | null; district: string | null; thana: string | null; village: string | null; hometownVisibility: string; hasPassword: boolean;
  notificationPrefs: Record<string, Pref>;
}

const TABS: [Tab, string][] = [['personal', 'ব্যক্তিগত তথ্য ও ঠিকানা'], ['profile', 'পাবলিক প্রোফাইল'], ['security', 'নিরাপত্তা'], ['notify', 'নোটিফিকেশন']];
const IDENTITIES = ['গল্পকার', 'কবি', 'স্মৃতিকথা লেখক', 'পাঠক'];
const NOTIFY: [string, string, string][] = [
  ['published', 'লেখা প্রকাশিত হলে', 'সম্পাদক অনুমোদন দিলে'],
  ['changes', 'সংশোধন চাওয়া হলে', 'সম্পাদকের মন্তব্যসহ'],
  ['featured', 'সম্পাদকের পছন্দে নির্বাচিত হলে', ''],
  ['weekly', 'সাপ্তাহিক পাঠের সারসংক্ষেপ', 'প্রতি শুক্রবার'],
  ['news', 'গল্পকথার খবর ও আয়োজন', 'লেখা প্রতিযোগিতা, কর্মশালা']
];

/** Turns what the API stores back into the form values (mobile without +880, date split in three). */
function toValues(p: Settings): ProfileValues {
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

/** Personal info & settings: personal data and address, public profile, security and notification choices. */
export function ProfileSettings({ displayName, username, startTab = 'personal' }: { displayName: string; username: string; startTab?: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(startTab);
  const [s, setS] = useState<Settings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // personal
  const [v, setV] = useState<ProfileValues>(emptyProfile);
  const [first, setFirst] = useState(''); const [last, setLast] = useState(''); const [email, setEmail] = useState('');
  // public profile
  const [nick, setNick] = useState(''); const [bio, setBio] = useState(''); const [identity, setIdentity] = useState(''); const [site, setSite] = useState('');
  const [topics, setTopics] = useState<string[]>([]); const [topicDraft, setTopicDraft] = useState('');
  // security
  const [curPw, setCurPw] = useState(''); const [newPw, setNewPw] = useState(''); const [newPw2, setNewPw2] = useState('');
  // notifications
  const [prefs, setPrefs] = useState<Record<string, Pref>>({});

  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<ProfileValues>) => { setMsg(null); setV((cur) => ({ ...cur, ...p })); };
  const pick = (t: Tab) => { setMsg(null); setTab(t); };

  function hydrate(d: Settings) {
    setS(d); setV(toValues(d)); setFirst(d.firstName); setLast(d.lastName); setEmail(d.email ?? '');
    setNick(d.nickname ?? ''); setBio(d.bio ?? ''); setIdentity(d.identityLabel ?? ''); setSite(d.website ?? ''); setTopics(d.topics); setPrefs(d.notificationPrefs);
  }
  async function reload() {
    const r = await bff<Settings>('GET', 'users/me/settings');
    if (!r.ok || !r.data) return setLoadError(r.ok ? 'সেটিংস লোড করা যায়নি।' : r.message);
    setLoadError(null); hydrate(r.data);
  }
  useEffect(() => { void reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fail = (r: { message: string | null; fields?: Record<string, string> | null }) =>
    setMsg({ ok: false, text: r.fields && Object.keys(r.fields).length ? Object.values(r.fields).join(' ') : (r.message ?? "ঠিক মতো সংরক্ষণ করা যায়নি।") });
  const done = (text = 'পরিবর্তন সংরক্ষিত হয়েছে।') => { setMsg({ ok: true, text }); router.refresh(); };

  async function savePersonal() {
    if (!s) return;
    if (!first.trim()) return setMsg({ ok: false, text: 'নামের প্রথম অংশ দিন।' });
    const r = toPayload(v);
    if ('error' in r) return setMsg({ ok: false, text: r.error });
    setBusy(true);
    const a = await bff('PUT', 'users/me/name', { firstName: first.trim(), lastName: last.trim() });
    if (!a.ok) { setBusy(false); return fail(a); }
    // The profile endpoint also writes nickname and bio, so send the values already saved.
    const b = await bff('PUT', 'users/me/profile', { ...r.payload, email: email.trim() || null, nickname: s.nickname, bio: s.bio });
    setBusy(false);
    if (!b.ok) return fail(b);
    await reload(); done();
  }

  async function savePublic() {
    setBusy(true);
    const r = await bff('PUT', 'users/me/public-profile', { nickname: nick.trim() || null, bio: bio.trim() || null, identityLabel: identity || null, website: site.trim() || null, topics });
    setBusy(false);
    if (!r.ok) return fail(r);
    await reload(); done();
  }

  async function savePassword() {
    if (newPw.length < 8) return setMsg({ ok: false, text: 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' });
    if (newPw !== newPw2) return setMsg({ ok: false, text: 'দুটি পাসওয়ার্ড মেলেনি।' });
    setBusy(true);
    const r = await bff('POST', 'users/me/password', { currentPassword: curPw || null, newPassword: newPw });
    setBusy(false);
    if (!r.ok) return fail(r);
    setCurPw(''); setNewPw(''); setNewPw2(''); done('পাসওয়ার্ড বদলানো হয়েছে।');
  }

  async function savePrefs() {
    setBusy(true);
    const r = await bff('PUT', 'users/me/notification-preferences', { prefs });
    setBusy(false);
    if (!r.ok) return fail(r);
    done();
  }

  function addTopic() {
    const t = topicDraft.trim();
    if (t && !topics.includes(t) && topics.length < 6) { setTopics([...topics, t]); setMsg(null); }
    setTopicDraft('');
  }

  const place = v.visibility === 'district' ? v.district : v.visibility === 'division' ? v.division : 'স্থান লুকানো';
  const shownName = nick.trim() || displayName;

  return (
    <div className="p-profile">
      <header className="p-profile__top">
        <Link href="/panel" className="p-profile__back"><Icon name="chevron" width={14} height={14} />লেখক প্যানেল</Link>
        <Link href={`/author/${username}`} className="c-btn c-btn--ghost"><Icon name="eye" width={16} height={16} />প্রোফাইল দেখুন</Link>
      </header>
      <main className="p-profile__main">
        <h1>ব্যক্তিগত তথ্য ও সেটিংস</h1>
        <p className="p-profile__sub">আপনার প্রোফাইল, যোগাযোগের তথ্য, ঠিকানা আর অ্যাকাউন্টের নিরাপত্তা এখানে দেখুন ও বদলান।</p>

        <div className="p-admin__tabs" role="tablist" aria-label="সেটিংস বিভাগ">
          {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-on' : ''} onClick={() => pick(id)}>{label}</button>)}
        </div>

        {loadError && <p className="c-ob__error" role="alert">{loadError}</p>}
        {!s && !loadError && <p className="p-profile__sub">লোড হচ্ছে…</p>}

        {s && tab === 'personal' && (
          <>
            <section className="p-profile__card">
              <h2>ব্যক্তিগত তথ্য <small className="p-profile__note">শুধু আপনি ও অ্যাডমিন দেখতে পান</small></h2>
              <div className="p-profile__row">
                <div className="c-ob__group"><label htmlFor="pf-first" className="c-ob__legend">নামের প্রথম অংশ</label><input id="pf-first" className="c-input" maxLength={60} value={first} onChange={(e) => { setMsg(null); setFirst(e.target.value); }} /></div>
                <div className="c-ob__group"><label htmlFor="pf-last" className="c-ob__legend">নামের শেষ অংশ</label><input id="pf-last" className="c-input" maxLength={60} value={last} onChange={(e) => { setMsg(null); setLast(e.target.value); }} /></div>
              </div>
              <div className="c-ob__group">
                <label htmlFor="pf-mail" className="c-ob__legend">ইমেইল <i>(ঐচ্ছিক)</i></label>
                <input id="pf-mail" className="c-input" type="email" autoComplete="email" value={email} onChange={(e) => { setMsg(null); setEmail(e.target.value); }} />
                <span className="c-ob__hint">{s.email && s.email === email.trim() ? (s.emailVerified ? '✓ যাচাইকৃত' : 'এখনো যাচাই হয়নি — যাচাইয়ের ইমেইল শীঘ্রই চালু হবে।') : 'ইমেইল বদলালে নতুনটি আবার যাচাই করতে হবে।'}</span>
              </div>
              <PersonalFields v={v} set={set} />
            </section>
            <section className="p-profile__card"><h2>ঠিকানা</h2><AddressFields v={v} set={set} /></section>
          </>
        )}

        {s && tab === 'profile' && (
          <section className="p-profile__card">
            <h2>পাবলিক প্রোফাইল</h2>
            <div className="p-profile__row">
              <div className="c-ob__group"><label htmlFor="pf-nick" className="c-ob__legend">প্রদর্শিত নাম</label><input id="pf-nick" className="c-input" maxLength={40} placeholder={`${s.firstName} ${s.lastName}`.trim()} value={nick} onChange={(e) => { setMsg(null); setNick(e.target.value); }} /><span className="c-ob__hint">ফাঁকা রাখলে আপনার পুরো নাম দেখাবে।</span></div>
              <div className="c-ob__group"><label htmlFor="pf-user" className="c-ob__legend">ইউজারনেম</label><input id="pf-user" className="c-input" value={`@${s.username}`} readOnly aria-readonly="true" /><span className="c-ob__hint">ইউজারনেম বদলানোর সুবিধা শীঘ্রই আসছে।</span></div>
            </div>
            <div className="c-ob__group">
              <span className="c-ob__legend" id="pf-id">পরিচয়</span>
              <div className="p-admin__roles-pick" role="radiogroup" aria-labelledby="pf-id">
                {IDENTITIES.map((i) => <button key={i} type="button" role="radio" aria-checked={identity === i} className={`c-chip${identity === i ? ' is-on' : ''}`} onClick={() => { setMsg(null); setIdentity(identity === i ? '' : i); }}>{i}</button>)}
              </div>
            </div>
            <div className="c-ob__group">
              <span className="c-ob__legend">যে বিষয়ে লেখেন <i>(সর্বোচ্চ ৬টি)</i></span>
              <div className="p-admin__roles-pick">
                {topics.map((t) => <button key={t} type="button" className="c-chip is-on" aria-label={`${t} সরান`} onClick={() => { setMsg(null); setTopics(topics.filter((x) => x !== t)); }}>{t} ×</button>)}
              </div>
              {topics.length < 6 && <input className="c-input" aria-label="বিষয় যোগ করুন" maxLength={30} placeholder="বিষয় লিখে Enter চাপুন" value={topicDraft} onChange={(e) => setTopicDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTopic(); } }} onBlur={addTopic} />}
            </div>
            <div className="c-ob__group"><label htmlFor="pf-site" className="c-ob__legend">ওয়েবসাইট <i>(ঐচ্ছিক)</i></label><input id="pf-site" className="c-input" inputMode="url" maxLength={200} placeholder="example.com" value={site} onChange={(e) => { setMsg(null); setSite(e.target.value); }} /></div>
            <div className="c-ob__group">
              <label htmlFor="pf-bio" className="c-ob__legend">সংক্ষিপ্ত পরিচিতি</label>
              <textarea id="pf-bio" className="c-textarea" rows={3} maxLength={160} value={bio} onChange={(e) => { setMsg(null); setBio(e.target.value); }} />
              <span className="c-ob__hint">{toBn(bio.length)} / ১৬০</span>
            </div>
            <div className="p-profile__preview">
              <small>পাঠকেরা যেভাবে দেখেন</small>
              <b>{shownName}</b>
              <span>@{s.username}{identity ? ` · ${identity}` : ''} · {place}</span>
              {bio && <p>{bio}</p>}
              <Link href={`/author/${username}`}>পুরো প্রোফাইল দেখুন →</Link>
            </div>
            <p className="p-profile__note">জন্মতারিখ, মোবাইল ও পুরো ঠিকানা কখনো পাবলিক প্রোফাইলে দেখানো হয় না।</p>
          </section>
        )}

        {s && tab === 'security' && (
          <>
            <section className="p-profile__card">
              <h2>পাসওয়ার্ড</h2>
              {s.hasPassword && <div className="c-ob__group"><label htmlFor="pw-cur" className="c-ob__legend">বর্তমান পাসওয়ার্ড</label><input id="pw-cur" className="c-input" type="password" autoComplete="current-password" value={curPw} onChange={(e) => { setMsg(null); setCurPw(e.target.value); }} /></div>}
              <div className="p-profile__row">
                <div className="c-ob__group"><label htmlFor="pw-new" className="c-ob__legend">নতুন পাসওয়ার্ড</label><input id="pw-new" className="c-input" type="password" autoComplete="new-password" value={newPw} onChange={(e) => { setMsg(null); setNewPw(e.target.value); }} /><span className="c-ob__hint">কমপক্ষে ৮ অক্ষর।</span></div>
                <div className="c-ob__group"><label htmlFor="pw-new2" className="c-ob__legend">আবার লিখুন</label><input id="pw-new2" className="c-input" type="password" autoComplete="new-password" value={newPw2} onChange={(e) => { setMsg(null); setNewPw2(e.target.value); }} /></div>
              </div>
            </section>
            <section className="p-profile__card is-soon">
              <h2>শীঘ্রই আসছে</h2>
              <ul className="p-profile__soon">
                <li><b>দুই ধাপে যাচাই</b><span>লগইনের সময় মোবাইলে কোড</span></li>
                <li><b>সংযুক্ত অ্যাকাউন্ট</b><span>Google, Facebook, Apple</span></li>
                <li><b>সক্রিয় ডিভাইস</b><span>অন্য ডিভাইস থেকে লগআউট</span></li>
                <li><b>অ্যাকাউন্ট নিষ্ক্রিয় বা মুছে ফেলা</b><span>প্রোফাইল ও লেখা লুকানো বা স্থায়ীভাবে মোছা</span></li>
              </ul>
            </section>
          </>
        )}

        {s && tab === 'notify' && (
          <section className="p-profile__card">
            <h2>কখন জানাব</h2>
            <p className="p-profile__note">এখন সব নোটিফিকেশন অ্যাপের ঘণ্টায় আসে। ইমেইল ও SMS পাঠানো চালু হলে আপনার এই পছন্দ মানা হবে।</p>
            <table className="p-admin__table p-profile__prefs">
              <thead><tr><th>বিষয়</th><th>ইমেইল</th><th>SMS</th></tr></thead>
              <tbody>
                {NOTIFY.map(([key, label, hint]) => {
                  const p = prefs[key] ?? { email: false, sms: false };
                  return (
                    <tr key={key}>
                      <th scope="row"><span className="p-admin__ttl">{label}</span>{hint && <small>{hint}</small>}</th>
                      {(['email', 'sms'] as const).map((ch) => (
                        <td key={ch} className="p-admin__matrix-cell">
                          <label className={`p-admin__check${p[ch] ? ' is-on' : ''}`}>
                            <input type="checkbox" checked={p[ch]} aria-label={`${label} — ${ch === 'email' ? 'ইমেইল' : 'SMS'}`} onChange={() => { setMsg(null); setPrefs({ ...prefs, [key]: { ...p, [ch]: !p[ch] } }); }} />
                            <Icon name="check" width={14} height={14} />
                          </label>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {msg && <p className={msg.ok ? 'p-admin__ok' : 'c-ob__error'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
        {s && (
          <div className="p-profile__foot">
            {tab === 'personal' && <button type="button" className="c-btn" disabled={busy} onClick={savePersonal}>{busy ? 'সংরক্ষণ হচ্ছে…' : 'পরিবর্তন সংরক্ষণ'}</button>}
            {tab === 'profile' && <button type="button" className="c-btn" disabled={busy} onClick={savePublic}>{busy ? 'সংরক্ষণ হচ্ছে…' : 'পরিবর্তন সংরক্ষণ'}</button>}
            {tab === 'security' && <button type="button" className="c-btn" disabled={busy || !newPw} onClick={savePassword}>{busy ? 'সংরক্ষণ হচ্ছে…' : 'পাসওয়ার্ড বদলান'}</button>}
            {tab === 'notify' && <button type="button" className="c-btn" disabled={busy} onClick={savePrefs}>{busy ? 'সংরক্ষণ হচ্ছে…' : 'পরিবর্তন সংরক্ষণ'}</button>}
          </div>
        )}
      </main>
    </div>
  );
}
