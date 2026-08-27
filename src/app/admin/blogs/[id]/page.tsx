import BlogForm from '@/components/admin/BlogForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: PageProps) {
  const { id } = await params;
  return <BlogForm mode="edit" blogId={id} />;
}
