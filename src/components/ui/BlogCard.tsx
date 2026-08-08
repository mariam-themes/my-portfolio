import Link from 'next/link';
import { format } from 'date-fns';
import { H3, P } from '@/components/ui/typography';

interface BlogCardProps {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  createdAt: string;
  tags?: string[];
}

export default function BlogCard({ title, slug, excerpt, coverImage, createdAt, tags }: BlogCardProps) {
  const formattedDate = format(new Date(createdAt), 'MMMM d, yyyy');

  return (
    <Link href={`/blog/${slug}`} className="group block h-full">
      <article className="flex flex-col h-full bg-white dark:bg-[#1a050c] border border-slate-200 dark:border-rose-950/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        
        {/* Cover Image Container */}
        <div className="relative h-64 w-full overflow-hidden bg-slate-100 dark:bg-black/40">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-rose-950/20">
              <span className="text-rose-500/50 uppercase tracking-widest text-xs font-bold">No Image</span>
            </div>
          )}
          
          {/* Overlay gradient for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-1 p-6 md:p-8">
          
          {/* Meta (Date & Tags) */}
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider mb-4 text-rose-500 dark:text-rose-400 font-medium">
            <time dateTime={createdAt}>{formattedDate}</time>
            {tags && tags.length > 0 && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="truncate">{tags[0]}</span>
              </>
            )}
          </div>

          {/* Title */}
          <H3 className="mb-3 font-semibold tracking-tight text-slate-900 dark:text-rose-50 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors line-clamp-2">
            {title}
          </H3>

          {/* Excerpt */}
          <P className="text-slate-600 dark:text-rose-100/70 text-sm md:text-base line-clamp-3 mb-6 mt-0">
            {excerpt}
          </P>

          {/* Read More Link (Push to bottom) */}
          <div className="mt-auto pt-4 flex items-center text-sm font-semibold tracking-wide text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors uppercase">
            Read Article
            <svg 
              className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          
        </div>
      </article>
    </Link>
  );
}
