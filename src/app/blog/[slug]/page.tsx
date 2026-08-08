import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { H1, P } from '@/components/ui/typography';

// Note: In Next.js 15+, page props params are Promises.
interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBlog(slug: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blogs/${slug}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    return null;
  }
  
  const json = await res.json();
  return json.success ? json.data : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  
  if (!blog) {
    return { title: 'Post Not Found' };
  }
  
  return {
    title: `${blog.title} | Mariam Portfolio`,
    description: blog.excerpt,
    openGraph: {
      images: blog.coverImage ? [blog.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const formattedDate = format(new Date(blog.createdAt), 'MMMM d, yyyy');

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-rose-500/30">
      
      {/* Article Header & Cover */}
      <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-slate-200 dark:border-rose-950/30">
        
        {/* Optional background image blur for atmosphere */}
        {blog.coverImage && (
          <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30 mix-blend-overlay">
            <img 
              src={blog.coverImage} 
              alt="Background" 
              className="w-full h-full object-cover blur-3xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50 dark:to-black" />
          </div>
        )}

        <div className="container mx-auto px-6 lg:px-8 max-w-4xl relative z-10">
          
          <Link href="/blog" className="inline-flex items-center text-sm font-semibold tracking-wide text-rose-600 dark:text-rose-500 hover:text-rose-800 dark:hover:text-rose-300 transition-colors uppercase mb-12 group">
            <ArrowLeft className="mr-2 w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Stories
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">
            <time dateTime={blog.createdAt}>{formattedDate}</time>
            {blog.tags && blog.tags.map((tag: string) => (
              <span key={tag} className="flex items-center gap-4">
                <span className="w-1 h-1 rounded-full bg-rose-500" />
                <span className="text-rose-600 dark:text-rose-400">{tag}</span>
              </span>
            ))}
          </div>

          <H1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 dark:text-white leading-[1.1]">
            {blog.title}
          </H1>
          
          <P className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-light leading-relaxed max-w-3xl border-l-2 border-rose-500 pl-6 ml-1">
            {blog.excerpt}
          </P>

        </div>
      </div>

      {/* Hero Image */}
      {blog.coverImage && (
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl -mt-8 md:-mt-12 relative z-20">
          <div className="w-full aspect-[21/9] md:aspect-[2.5/1] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="container mx-auto px-6 lg:px-8 max-w-3xl py-20 md:py-32">
        <article 
          className="prose prose-lg md:prose-xl prose-slate dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-rose-600 dark:prose-a:text-rose-400 hover:prose-a:text-rose-500 prose-img:rounded-2xl prose-img:shadow-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        
        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-rose-950/30 flex justify-between items-center">
          <p className="text-slate-500 dark:text-slate-400 italic">
            End of article
          </p>
          <Link href="/blog" className="text-rose-600 dark:text-rose-500 font-semibold hover:underline">
            Read more stories
          </Link>
        </div>
      </div>

    </main>
  );
}
