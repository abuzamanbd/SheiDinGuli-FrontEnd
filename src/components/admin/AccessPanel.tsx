'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { bff } from '@/lib/bff';
import { timeAgoBn, toBn } from '@/lib/bn';
import {
  PERMISSION_GROUPS, PERMISSION_LABEL, SUPER_ADMIN, roleLabel,
  type AccessOverview, type RoleInfo, type StaffMember, type StaffPage
} from '@/lib/admin/access';
import { Icon } from '../Icon';

type Tab = 'roles' | 'team';

/** "অ্যাডমিন ও ভূমিকা" — the permission matrix and the admin team (Super Admin only). */
export function AccessPanel({ selfUsername }: { selfUsername: string }) {
  const [tab, setTab] = useState<Tab>('roles');
  const [overview, setOverview] = useState<AccessOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    const res = await bff<AccessOverview>('GET', 'roles');
    if (!res.ok) return setError(res.message);
    setError(null);
    setOverview(res.data);
  }, []);
  useEffect(() => { void loadOverview(); }, [loadOverview]);

  return (
    <section className="p-admin__card" aria-labelledby="acc-h">
      <div className="p-admin__card-head">
        <h2 id="acc-h">অ্যাডমিন ভূমিকা ও অনুমতি</h2>
        <div className="p-admin__tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'roles'} className={tab === 'roles' ? 'is-on' : ''} onClick={() => setTab('roles')}>ভূমিকা ও অনুমতি</button>
          <button type="button" role="tab" aria-selected={tab === 'team'} className={tab === 'team' ? 'is-on' : ''} onClick={() => setTab('team')}>দল</button>
        </div>
      </div>
      {error && <p className="p-admin__error" role="alert">{error}</p>}
      {!overview && !error && <p className="p-admin__empty">লোড হচ্ছে…</p>}
      {overview && tab === 'roles' && <RolesMatrix overview={overview} onSaved={loadOverview} />}
      {overview && tab === 'team' && <Team roles={overview.roles} selfUsername={selfUsername} onChanged={loadOverview} />}
    </section>
  );
}

// ---------------------------------------------------------------- matrix

function RolesMatrix({ overview, onSaved }: { overview: AccessOverview; onSaved: () => Promise<void> }) {
  // Staged changes: role id -> set of permission names. A role missing from the map is unchanged.
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const known = useMemo(() => new Set(overview.permissions.map((p) => p.name)), [overview.permissions]);
  const groups = useMemo(() => {
    const listed = new Set(PERMISSION_GROUPS.flatMap(([, names]) => names));
    const groupsOut = PERMISSION_GROUPS.map(([title, names]) => [title, names.filter((n) => known.has(n))] as [string, string[]]);
    const extra = overview.permissions.map((p) => p.name).filter((n) => !listed.has(n));
    if (extra.length) groupsOut.push(['অন্যান্য', extra]);
    return groupsOut.filter(([, names]) => names.length > 0);
  }, [known, overview.permissions]);

  const has = (r: RoleInfo, perm: string) => (draft[r.id] ?? r.permissions).includes(perm);
  const dirtyRoles = overview.roles.filter((r) => draft[r.id]);

  function toggle(r: RoleInfo, perm: string) {
    if (r.name === SUPER_ADMIN) return;
    setMessage(null);
    setDraft((cur) => {
      const now = cur[r.id] ?? r.permissions;
      const next = now.includes(perm) ? now.filter((p) => p !== perm) : [...now, perm];
      const same = next.length === r.permissions.length && next.every((p) => r.permissions.includes(p));
      const copy = { ...cur };
      if (same) delete copy[r.id]; else copy[r.id] = next;
      return copy;
    });
  }

  async function save() {
    setBusy(true); setMessage(null);
    for (const r of dirtyRoles) {
      const res = await bff('PUT', `roles/${r.id}/permissions`, { permissions: draft[r.id] });
      if (!res.ok) { setBusy(false); return setMessage({ ok: false, text: `${roleLabel(r.name)}: ${res.message}` }); }
    }
    setDraft({});
    await onSaved();
    setBusy(false);
    setMessage({ ok: true, text: 'অনুমতি সংরক্ষণ হয়েছে। যাঁদের ভূমিকা বদলেছে তাঁরা আবার লগইন করলে নতুন অনুমতি কার্যকর হবে।' });
  }

  return (
    <>
      <p className="p-admin__lead">কোন ভূমিকা কী দেখবে ও করতে পারবে — প্রতিটি অনুমতি আলাদা। সুপার অ্যাডমিনের অনুমতি বদলানো যায় না।</p>
      <div className="p-admin__scroll">
        <table className="p-admin__table p-admin__matrix">
          <thead>
            <tr>
              <th>অনুমতি</th>
              {overview.roles.map((r) => (
                <th key={r.id} className="p-admin__matrix-role" scope="col"><span>{roleLabel(r.name)}</span><small>{toBn(r.userCount)} জন</small></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(([title, names]) => (
              <GroupRows key={title} title={title} names={names} roles={overview.roles} has={has} toggle={toggle} overview={overview} />
            ))}
          </tbody>
        </table>
      </div>

      {message && <p className={message.ok ? 'p-admin__ok' : 'p-admin__error'} role="status">{message.text}</p>}
      <div className="p-admin__savebar">
        <span>{dirtyRoles.length ? `${toBn(dirtyRoles.length)}টি ভূমিকায় অসংরক্ষিত পরিবর্তন` : 'কোনো পরিবর্তন নেই'}</span>
        <button type="button" className="c-btn c-btn--ghost" disabled={!dirtyRoles.length || busy} onClick={() => setDraft({})}>বাতিল</button>
        <button type="button" className="c-btn" disabled={!dirtyRoles.length || busy} onClick={save}>{busy ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</button>
      </div>

      <div className="p-admin__notes">
        <div><b>লেখা প্রকাশের ধাপ</b><p>লেখক জমা দেন → নীতিমালা শব্দ স্বয়ংক্রিয় যাচাই → পর্যালোচক সুপারিশ করেন → সম্পাদক প্রকাশ বা ফেরত পাঠান।</p></div>
        <div><b>চিহ্নিত লেখা</b><p>“সতর্কতা” তালিকার শব্দে লেখা সারিতে লাল চিহ্ন পায়; “কঠোর” তালিকায় স্বয়ংক্রিয়ভাবে আটকে যায়।</p></div>
        <div><b>বিশ্বস্ত লেখক</b><p>সাধারণ লেখকের লেখা অনুমোদন লাগে। “সরাসরি প্রকাশ” অনুমতি থাকলেও নীতিমালা যাচাই চলে।</p></div>
      </div>
    </>
  );
}

function GroupRows({ title, names, roles, has, toggle, overview }: {
  title: string; names: string[]; roles: RoleInfo[]; overview: AccessOverview;
  has: (r: RoleInfo, p: string) => boolean; toggle: (r: RoleInfo, p: string) => void;
}) {
  return (
    <>
      <tr className="p-admin__matrix-group"><th colSpan={roles.length + 1} scope="colgroup">{title}</th></tr>
      {names.map((name) => {
        const [label, hint] = PERMISSION_LABEL[name] ?? [name, overview.permissions.find((p) => p.name === name)?.description ?? ''];
        return (
          <tr key={name}>
            <th scope="row" className="p-admin__matrix-perm"><span>{label}</span>{hint && <small>{hint}</small>}</th>
            {roles.map((r) => {
              const on = r.name === SUPER_ADMIN ? true : has(r, name);
              return (
                <td key={r.id} className="p-admin__matrix-cell">
                  <label className={`p-admin__check${on ? ' is-on' : ''}${r.name === SUPER_ADMIN ? ' is-locked' : ''}`}>
                    <input type="checkbox" checked={on} disabled={r.name === SUPER_ADMIN} onChange={() => toggle(r, name)} aria-label={`${roleLabel(r.name)} — ${label}`} />
                    <Icon name="check" width={14} height={14} />
                  </label>
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------- team

const EMPTY_FORM = { firstName: '', lastName: '', username: '', password: '', email: '', roles: [] as string[] };

function Team({ roles, selfUsername, onChanged }: { roles: RoleInfo[]; selfUsername: string; onChanged: () => Promise<void> }) {
  const [page, setPage] = useState<StaffPage | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const assignable = roles.filter((r) => r.isActive);

  const load = useCallback(async (q: string) => {
    const res = await bff<StaffPage>('GET', `users/staff?pageSize=50${q ? `&search=${encodeURIComponent(q)}` : ''}`);
    if (!res.ok) return setError(res.message);
    setError(null);
    setPage(res.data);
  }, []);
  useEffect(() => { const t = setTimeout(() => void load(search), 250); return () => clearTimeout(t); }, [search, load]);

  const refresh = async () => { await Promise.all([load(search), onChanged()]); };
  const flip = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function saveRoles(m: StaffMember) {
    if (!editRoles.length) return setError('কমপক্ষে একটি ভূমিকা বেছে নিন।');
    setBusy(true);
    const res = await bff('PUT', `users/${m.id}/roles`, { roles: editRoles });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setEditing(null);
    await refresh();
  }

  async function toggleActive(m: StaffMember) {
    setBusy(true);
    const res = await bff('POST', `users/${m.id}/${m.isActive ? 'suspend' : 'activate'}`);
    setBusy(false);
    if (!res.ok) return setError(res.message);
    await refresh();
  }

  async function create() {
    setFormError(null);
    if (!form.firstName.trim() || !form.lastName.trim() || !form.username.trim()) return setFormError('নাম ও ইউজারনেম দিন।');
    if (form.password.length < 8) return setFormError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
    if (!form.roles.length) return setFormError('কমপক্ষে একটি ভূমিকা বেছে নিন।');
    setBusy(true);
    const res = await bff('POST', 'users/staff', { ...form, email: form.email.trim() || null });
    setBusy(false);
    if (!res.ok) return setFormError(res.message);
    setForm(EMPTY_FORM); setAdding(false);
    await refresh();
  }

  return (
    <>
      <div className="p-admin__toolbar">
        <input className="c-input" type="search" placeholder="নাম, ইউজারনেম বা ইমেইল খুঁজুন" aria-label="দল খুঁজুন" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" className="c-btn" onClick={() => { setAdding(!adding); setFormError(null); }}><Icon name="plus" width={17} height={17} />নতুন সদস্য</button>
      </div>

      {adding && (
        <div className="p-admin__form">
          <div className="p-admin__form-grid">
            <label>নামের প্রথম অংশ<input className="c-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
            <label>নামের শেষ অংশ<input className="c-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
            <label>ইউজারনেম<input className="c-input" autoCapitalize="none" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
            <label>পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)<input className="c-input" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            <label>ইমেইল (ঐচ্ছিক)<input className="c-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          </div>
          <fieldset className="p-admin__roles-pick">
            <legend>ভূমিকা</legend>
            {assignable.map((r) => (
              <button key={r.id} type="button" role="checkbox" aria-checked={form.roles.includes(r.name)} className={`c-chip${form.roles.includes(r.name) ? ' is-on' : ''}`} onClick={() => setForm({ ...form, roles: flip(form.roles, r.name) })}>{roleLabel(r.name)}</button>
            ))}
          </fieldset>
          {formError && <p className="p-admin__error" role="alert">{formError}</p>}
          <div className="p-admin__form-foot">
            <button type="button" className="c-btn c-btn--ghost" onClick={() => setAdding(false)}>বাতিল</button>
            <button type="button" className="c-btn" disabled={busy} onClick={create}>{busy ? 'তৈরি হচ্ছে…' : 'সদস্য তৈরি করুন'}</button>
          </div>
        </div>
      )}

      {error && <p className="p-admin__error" role="alert">{error}</p>}
      {page && page.items.length === 0 && <p className="p-admin__empty">কোনো সদস্য পাওয়া যায়নি।</p>}
      {page && page.items.length > 0 && (
        <div className="p-admin__scroll">
          <table className="p-admin__table">
            <thead><tr><th>সদস্য</th><th>ভূমিকা</th><th>সর্বশেষ লগইন</th><th>অবস্থা</th><th /></tr></thead>
            <tbody>
              {page.items.map((m) => {
                const me = m.username === selfUsername;
                return (
                  <tr key={m.id}>
                    <td><span className="p-admin__ttl">{m.displayName}{me && <em className="p-admin__me"> (আপনি)</em>}</span><small>@{m.username}{m.email ? ` · ${m.email}` : ''}</small></td>
                    <td>
                      {editing === m.id ? (
                        <div className="p-admin__roles-pick">
                          {assignable.map((r) => (
                            <button key={r.id} type="button" role="checkbox" aria-checked={editRoles.includes(r.name)} className={`c-chip${editRoles.includes(r.name) ? ' is-on' : ''}`} onClick={() => setEditRoles(flip(editRoles, r.name))}>{roleLabel(r.name)}</button>
                          ))}
                        </div>
                      ) : m.roles.map((r) => <span key={r} className="p-admin__pill">{roleLabel(r)}</span>)}
                    </td>
                    <td>{m.lastLoginAtUtc ? timeAgoBn(m.lastLoginAtUtc) : '—'}</td>
                    <td><span className={`p-admin__pill${m.isActive ? '' : ' is-red'}`}>{m.isActive ? 'সক্রিয়' : 'স্থগিত'}</span></td>
                    <td className="p-admin__actions">
                      {editing === m.id ? (
                        <>
                          <button type="button" className="c-btn c-btn--ghost" onClick={() => setEditing(null)}>বাতিল</button>
                          <button type="button" className="c-btn" disabled={busy} onClick={() => saveRoles(m)}>সংরক্ষণ</button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="c-btn c-btn--ghost" onClick={() => { setEditing(m.id); setEditRoles(m.roles); setError(null); }}>ভূমিকা বদলান</button>
                          {!me && <button type="button" className="c-btn c-btn--ghost" disabled={busy} onClick={() => toggleActive(m)}>{m.isActive ? 'স্থগিত করুন' : 'সক্রিয় করুন'}</button>}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="p-admin__hint">নতুন সদস্য তৈরি হলে তাঁকে অনবোর্ডিং ফর্ম পূরণ করতে হয় না। ভূমিকা বদলালে সেই সদস্যকে আবার লগইন করতে হবে।</p>
    </>
  );
}
