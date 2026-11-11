/** Server-side settings for talking to the ASP.NET API. Never imported by client components. */
export const API_BASE_URL = (process.env.API_BASE_URL ?? 'https://localhost:61847').replace(/\/$/, '');

export const COOKIE = {
  access: 'sdg_at',
  refresh: 'sdg_rt',
  /** Non-secret display info (name, roles) so the header can show who is signed in without an API call. */
  session: 'sdg_session'
} as const;
