'use client';

import { useEffect } from 'react';
import { bff } from '@/lib/bff';

/** Counts one view per reader per post per browser session. */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `sdg_viewed_${slug}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch { /* private mode: count anyway */ }
    void bff('POST', `public/posts/${encodeURIComponent(slug)}/view`);
  }, [slug]);
  return null;
}
