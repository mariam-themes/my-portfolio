import { Metadata } from 'next';
import { H1, P } from '@/components/ui/typography';
import BlogCard from '@/components/ui/BlogCard';

export const metadata: Metadata = {
  title: 'Insights & Stories | Mariam Portfolio',
  description: 'Thoughts on design, architecture, and luxury experiences.',
};

async function getBlogs() {
  // Use absolute URL for server-side fetching during SSR
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blogs`, {
    cache: 'no-store', // ensures we always get the latest posts
  });
  
  if (!res.ok) {
    return [];
  }
  
  const json = await res.json();
  return json.success ? json.data : [];
}

export default async function BlogIndexPage() {
  const blogs = await getBlogs();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-20">
          <p className="text-sm font-bold tracking-widest text-rose-600 dark:text-rose-500 uppercase mb-4">
            Editorial
          </p>
          <H1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
            Insights & Stories
          </H1>
          <P className="text-xl md:text-2xl text-slate-600 dark:text-slate-400">
            Thoughts, case studies, and perspectives on luxury design, architecture, and creating timeless digital experiences.
          </P>
        </div>

        {/* Grid Section */}
        {blogs.length === 0 ? (
          <div className="py-24 text-center border-t border-slate-200 dark:border-rose-950/30">
            <P className="text-slate-500 text-lg">No stories published yet. Check back soon.</P>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {blogs.map((blog: any) => (
              <BlogCard
                key={blog._id}
                title={blog.title}
                slug={blog.slug}
                excerpt={blog.excerpt}
                coverImage={blog.coverImage}
                createdAt={blog.createdAt}
                tags={blog.tags}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
