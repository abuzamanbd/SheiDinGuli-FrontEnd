import { getSession } from '@/lib/auth/session';
import { ProfileSettings } from '@/components/profile/ProfileSettings';

export const metadata = { title: 'আমার প্রোফাইল — গল্পকথা' };

export default async function ProfileSettingsPage() {
  const user = (await getSession())!; // the workspace layout already redirects signed-out visitors
  return <ProfileSettings displayName={user.displayName} username={user.username} />;
}
