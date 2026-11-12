import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ProfileSettings } from '@/components/profile/ProfileSettings';

export const metadata = { title: 'ব্যক্তিগত তথ্য ও সেটিংস — গল্পকথা' };

export default async function ProfileSettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await getSession();
  if (!user) redirect('/?login=1'); // layout and page render in parallel, so guard here too
  const { tab } = await searchParams;
  const startTab = tab === 'profile' || tab === 'security' || tab === 'notify' ? tab : 'personal';
  return <ProfileSettings displayName={user.displayName} username={user.username} startTab={startTab} />;
}
