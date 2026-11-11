import { API_BASE_URL } from './config';

export interface BackendResponse<T = unknown> {
  ok: boolean;
  /** 0 means the API could not be reached at all. */
  status: number;
  data: T | null;
}

/** POST a JSON body to the API (server side only). */
export async function callBackend<T = unknown>(path: string, body?: unknown, accessToken?: string): Promise<BackendResponse<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify(body ?? {}),
      cache: 'no-store'
    });
    const text = await res.text();
    let data: T | null = null;
    try { data = text ? (JSON.parse(text) as T) : null; } catch { /* not JSON */ }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}
