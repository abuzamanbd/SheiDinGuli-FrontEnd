'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { AuthFormError, SessionUser } from '@/lib/auth/types';
import { landingFor, needsOnboarding } from '@/lib/auth/roles';
import { Icon } from '../Icon';
import { LATER_KEY, OnboardingModal } from './OnboardingModal';

type Mode = 'login' | 'register';
interface Ctx { open: (mode?: Mode) => void; close: () => void; user: SessionUser | null; logout: () => Promise<void> }
const AuthContext = createContext<Ctx>({ open: () => {}, close: () => {}, user: null, logout: async () => {} });
export const useAuthModal = () => useContext(AuthContext);

export function AuthModalProvider({ children, siteName, user }: { children: ReactNode; siteName: string; user: SessionUser | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
  }, [router]);
  const open = useCallback((m: Mode = 'login') => setMode(m), []);
  // Pages that need a signed-in user redirect to /?login=1
  useEffect(() => { if (!user && new URLSearchParams(window.location.search).get('login') === '1') setMode('login'); }, [user]);
  const close = useCallback(() => setMode(null), []);

  useEffect(() => {
    if (!mode) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('u-no-scroll');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('u-no-scroll'); };
  }, [mode, close]);

  // First time only: authors who signed up themselves fill in the profile form. Staff accounts never see it.
  const [obOpen, setObOpen] = useState(false);
  const wantsOnboarding = !!user && needsOnboarding(user);
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!userId) { setObOpen(false); return; }
    if (!wantsOnboarding) return; // keep an open modal on screen: saving the form flips this to false while the "done" step is showing
    let later = false;
    try { later = sessionStorage.getItem(LATER_KEY) === '1'; } catch { /* ignore */ }
    if (!later) setObOpen(true);
  }, [userId, wantsOnboarding]);

  return (
    <AuthContext.Provider value={{ open, close, user, logout }}>
      {children}
      {mode && <AuthDialog mode={mode} setMode={setMode} onClose={close} siteName={siteName} />}
      {user && obOpen && !mode && <OnboardingModal user={user} onClose={() => setObOpen(false)} />}
    </AuthContext.Provider>
  );
}

function AuthDialog({ mode, setMode, onClose, siteName }: { mode: Mode; setMode: (m: Mode) => void; onClose: () => void; siteName: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const firstRef = useRef<HTMLInputElement>(null);
  useEffect(() => { firstRef.current?.focus(); setErrors({}); setDone(null); setFormError(null); }, [mode]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? '').trim();
    const next: Record<string, string> = {};
    if (mode === 'register') {
      if (!v('first')) next.first = 'নামের প্রথম অংশ লিখুন';
      if (!v('last')) next.last = 'নামের শেষ অংশ লিখুন';
      if (!/^[a-zA-Z0-9_.]{3,30}$/.test(v('username'))) next.username = 'ইউজারনেম ৩–৩০ অক্ষর; ইংরেজি অক্ষর, সংখ্যা, ডট ও _ চলবে';
    } else if (!v('username')) next.username = 'ইউজারনেম লিখুন';
    if (v('password').length < 8) next.password = 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first: v('first'), last: v('last'), username: v('username'), password: v('password') })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = data as AuthFormError;
        setErrors(err.fields ?? {});
        setFormError(err.message ?? 'কিছু একটা সমস্যা হয়েছে।');
        return;
      }
      setDone(mode === 'login' ? 'লগইন সফল হয়েছে।' : 'অ্যাকাউন্ট তৈরি হয়েছে। স্বাগতম!');
      // Staff (admins the super admin created) land on the admin dashboard, authors on their panel.
      // New authors see the onboarding modal on top of the panel because their profile is not complete yet.
      const signedIn = (data as { user: SessionUser }).user;
      try { sessionStorage.removeItem(LATER_KEY); } catch { /* ignore */ }
      router.push(landingFor(signedIn));
      router.refresh();
      setTimeout(onClose, 500);
    } catch {
      setFormError('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।');
    } finally {
      setBusy(false);
    }
  }

  const field = (name: string, label: string, type = 'text', autoComplete?: string, ref?: boolean) => (
    <label className="c-field">
      <span className="c-field__label">{label}</span>
      <input ref={ref ? firstRef : undefined} className="c-field__input" name={name} type={type} autoComplete={autoComplete} aria-invalid={errors[name] ? 'true' : undefined} />
      {errors[name] && <span className="c-field__error">{errors[name]}</span>}
    </label>
  );

  return (
    <div className="c-modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="c-modal__panel" role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'লগইন' : 'নিবন্ধন'}>
        <aside className="c-auth__side">
          <div className="c-auth__brand"><Icon name="feather" /> {siteName}</div>
          <p className="c-auth__slogan">আপনার গল্পটা এবার সবার কাছে পৌঁছাক।</p>
          <ul className="c-auth__points">
            {['বাংলায় লিখুন, সহজে', 'প্রকাশের আগে যত্নে পর্যালোচনা', 'পাঠকের পছন্দ ও মন্তব্য'].map((t) => (
              <li key={t}><span className="c-auth__tick"><Icon name="check" width={14} height={14} /></span>{t}</li>
            ))}
          </ul>
        </aside>
        <form className="c-auth__form" onSubmit={submit} noValidate>
          <div className="c-auth__top">
            <div className="c-auth__tabs" role="tablist">
              <button type="button" role="tab" aria-selected={mode === 'login'} className={`c-auth__tab${mode === 'login' ? ' is-on' : ''}`} onClick={() => setMode('login')}>লগইন</button>
              <button type="button" role="tab" aria-selected={mode === 'register'} className={`c-auth__tab${mode === 'register' ? ' is-on' : ''}`} onClick={() => setMode('register')}>নিবন্ধন</button>
            </div>
            <button type="button" className="c-icon-btn" onClick={onClose} aria-label="বন্ধ করুন"><Icon name="close" /></button>
          </div>
          <div>
            <h2 className="c-auth__title">{mode === 'login' ? 'আবার স্বাগতম' : 'নতুন অ্যাকাউন্ট খুলুন'}</h2>
            <p className="c-auth__sub">{mode === 'login' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন।' : 'কয়েকটি তথ্য দিলেই শুরু করা যায়।'}</p>
          </div>
          <div className="c-auth__social">
            <button type="button" className="c-social-btn"><Icon name="google" width={18} height={18} />গুগল</button>
            <button type="button" className="c-social-btn"><Icon name="facebook" width={18} height={18} />ফেসবুক</button>
            <button type="button" className="c-social-btn"><Icon name="mail" width={18} height={18} />ইমেইল</button>
          </div>
          <div className="c-auth__divider">অথবা ইউজারনেম দিয়ে</div>
          {mode === 'register' && (
            <div className="c-auth__row">{field('first', 'নামের প্রথম অংশ', 'text', 'given-name', true)}{field('last', 'নামের শেষ অংশ', 'text', 'family-name')}</div>
          )}
          {field('username', 'ইউজারনেম', 'text', 'username', mode === 'login')}
          {field('password', 'পাসওয়ার্ড', 'password', mode === 'login' ? 'current-password' : 'new-password')}
          {mode === 'login' && (
            <div className="c-field__row">
              <label className="c-auth__check"><input type="checkbox" name="remember" /> মনে রাখুন</label>
              <a href="#" className="c-auth__forgot">পাসওয়ার্ড ভুলে গেছেন?</a>
            </div>
          )}
          {mode === 'register' && <p className="c-auth__note"><Icon name="check" width={16} height={16} />জন্মতারিখ, মোবাইল ও ইমেইল প্রথম লগইনের পর চাওয়া হবে।</p>}
          {formError && <p className="c-auth__error" role="alert">{formError}</p>}
          {done && <p className="c-auth__success" role="status">{done}</p>}
          <button type="submit" className="c-btn c-btn--lg" disabled={busy}>{busy ? 'অপেক্ষা করুন…' : mode === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট খুলুন'}</button>
        </form>
      </div>
    </div>
  );
}
