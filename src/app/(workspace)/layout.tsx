import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

/** Signed-in area (writing, panels). No site header/footer here; each screen brings its own chrome. */
export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/?login=1');
  return <div className="l-workspace">{children}</div>;
}
