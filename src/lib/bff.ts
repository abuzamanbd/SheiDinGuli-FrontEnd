/** Browser-side helper: talks to the ASP.NET API through our own /api/bff route (tokens stay in httpOnly cookies). */
export interface BffResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  /** A message that can be shown to the person. */
  message: string | null;
  /** Field level messages from the API's validation errors. */
  fields: Record<string, string>;
}

interface Problem { title?: string; detail?: string; errors?: Record<string, string[]> }

export async function bff<T = unknown>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown, signal?: AbortSignal): Promise<BffResult<T>> {
  try {
    const res = await fetch(`/api/bff/${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      cache: 'no-store'
    });
    const text = await res.text();
    let json: unknown = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
    if (res.ok) return { ok: true, status: res.status, data: json as T, message: null, fields: {} };

    const p = (json ?? {}) as Problem;
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(p.errors ?? {})) fields[k.charAt(0).toLowerCase() + k.slice(1)] = v[0] ?? '';
    const first = Object.values(fields)[0];
    const message =
      res.status === 401 ? 'সেশন শেষ হয়ে গেছে, আবার লগইন করুন।'
      : res.status === 403 ? 'এই কাজের অনুমতি আপনার নেই।'
      : p.detail ?? first ?? p.title ?? 'কিছু একটা সমস্যা হয়েছে।';
    return { ok: false, status: res.status, data: null, message, fields };
  } catch (e) {
    if ((e as Error).name === 'AbortError') return { ok: false, status: 0, data: null, message: null, fields: {} };
    return { ok: false, status: 0, data: null, message: 'সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।', fields: {} };
  }
}
