import { PostEditor } from '@/components/editor/PostEditor';

export const metadata = { title: 'লেখা সম্পাদনা — গল্পকথা' };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostEditor postId={id} />;
}
