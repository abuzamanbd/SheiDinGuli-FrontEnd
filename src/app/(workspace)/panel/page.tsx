import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { isStaff } from '@/lib/auth/roles';
import { AuthorPanel } from '@/components/panel/AuthorPanel';

export const metadata = { title: 'লেখক প্যানেল — গল্পকথা' };

export default async function PanelPage() {
  const user = await getSession();
  if (!user) redirect('/?login=1'); // layout and page render in parallel, so guard here too
  return <AuthorPanel displayName={user.displayName} username={user.username} staff={isStaff(user)} />;
}
