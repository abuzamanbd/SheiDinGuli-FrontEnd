import { Home } from '@/components/sections/Home';
import type { HomeLayoutKey } from '@/lib/types';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ layout?: string }> }) {
  // ?layout=classic|magazine lets you preview both designs. The real choice comes from the admin setting.
  const { layout } = await searchParams;
  const forced = layout === 'classic' || layout === 'magazine' ? (layout as HomeLayoutKey) : undefined;
  return <Home layout={forced} />;
}
