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
    <main className="min-h-screen bg-transparent pt-32 pb-24 relative z-10">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-20 text-left">
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-accent mb-4">
            <span className="w-12 h-[1px] bg-accent/50"></span>
            JOURNAL
          </div>
          <H1 className="text-5xl md:text-7xl font-serif font-normal tracking-tight mb-6 text-foreground">
            Insights & Stories.
          </H1>
          <P className="text-xl font-sans text-foreground/70">
            Thoughts, case studies, and perspectives on luxury design, architecture, and creating timeless digital experiences.
          </P>
        </div>

        {/* Grid Section */}
        {blogs.length === 0 ? (
          <div className="py-24 text-center border-t border-card-border">
            <P className="text-foreground/50 text-lg font-serif">No stories published yet. Check back soon.</P>
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
