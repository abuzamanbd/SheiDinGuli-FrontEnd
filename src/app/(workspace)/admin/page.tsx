import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { adminRoleOf, isStaff } from '@/lib/auth/roles';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata = { title: 'অ্যাডমিন প্যানেল — গল্পকথা' };

/** Admin side. Only people with a staff role get in; authors are sent to their own panel. */
export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect('/?login=1');
  if (!isStaff(user)) redirect('/panel');
  return <AdminDashboard roleId={adminRoleOf(user)} displayName={user.displayName} username={user.username} />;
}
