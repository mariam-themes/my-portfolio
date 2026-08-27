import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/models/Blog';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Plus, Edit2, Check } from 'lucide-react';
import DeleteItemButton from '@/components/admin/DeleteItemButton';
import Image from 'next/image';

export const metadata = {
  title: 'Blog | Admin Dashboard',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminBlogsPage() {
  const t = await getTranslations('Admin.blogsList');
  const dt = await getTranslations('Admin.deleteBlog');

  await connectToDatabase();
  const rawBlogs = await Blog.find().sort({ createdAt: -1 }).lean();
  const blogs = JSON.parse(JSON.stringify(rawBlogs)).map((b: any) => ({
    ...b,
    _id: String(b._id),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('title')}</h1>
          <p className="text-rose-200/60 mt-1">{t('subtitle')}</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-rose-900/20"
        >
          <Plus className="w-5 h-5" />
          {t('addNew')}
        </Link>
      </div>

      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-12 text-center">
          <p className="text-rose-300">{t('noBlogs')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: any) => (
            <div
              key={blog._id}
              className="bg-black/40 border border-rose-900/30 rounded-xl overflow-hidden flex flex-col transition-all hover:border-rose-700/50 hover:shadow-lg hover:shadow-rose-900/10"
            >
              {/* Cover Image */}
              <div className="relative aspect-video w-full bg-rose-950/50">
                {blog.coverImage ? (
                  <Image
                    src={blog.coverImage}
                    alt={blog.title || 'Blog cover'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-rose-500/30 text-sm">
                    {t('noCover')}
                  </div>
                )}
                {blog.isPublished && (
                  <span className="absolute top-3 right-3 ltr:right-3 rtl:right-auto rtl:left-3 px-2 py-1 rounded text-xs font-bold shadow-lg bg-emerald-500/90 text-emerald-50">
                    {t('published')}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                  {blog.title}
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(blog.tags || []).slice(0, 3).map((tag: string, i: number) => (
                    <span key={i} className="text-xs bg-rose-950/50 text-rose-300 px-2 py-1 rounded border border-rose-900/50">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-rose-900/30 flex items-center justify-between">
                  <Link
                    href={`/blog/${blog.slug}`}
                    target="_blank"
                    className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" /> {t('view')}
                  </Link>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/blogs/${blog._id}`}
                      className="inline-flex items-center text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Check className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" /> {t('edit')}
                    </Link>
                    <DeleteItemButton
                      itemId={blog._id}
                      endpoint="/api/blogs"
                      confirmText={dt('confirm', { title: blog.title })}
                      successText={dt('success')}
                      failedText={dt('failed')}
                      deleteText={dt('delete')}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
