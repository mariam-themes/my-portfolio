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
      <article className="flex flex-col h-full glass-card overflow-hidden hover:shadow-2xl hover:shadow-black/50 transition-all duration-500 hover:-translate-y-1">
        
        {/* Cover Image Container */}
        <div className="relative h-64 w-full overflow-hidden bg-card-bg">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card-bg">
              <span className="text-foreground/30 uppercase tracking-widest text-xs font-bold font-serif">No Image</span>
            </div>
          )}
          
          {/* Overlay gradient for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-1 p-6 md:p-8">
          
          {/* Meta (Date & Tags) */}
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] mb-4 text-accent font-medium">
            <time dateTime={createdAt}>{formattedDate}</time>
            {tags && tags.length > 0 && (
              <>
                <span className="text-accent/50">•</span>
                <span className="truncate">{tags[0]}</span>
              </>
            )}
          </div>

          {/* Title */}
          <H3 className="mb-4 font-serif font-normal text-2xl tracking-wide text-foreground group-hover:text-accent transition-colors line-clamp-2 border-none pb-0">
            {title}
          </H3>

          {/* Excerpt */}
          <P className="text-foreground/70 font-sans text-sm leading-relaxed line-clamp-3 mb-6 mt-0">
            {excerpt}
          </P>

          {/* Read More Link (Push to bottom) */}
          <div className="mt-auto pt-4 flex items-center text-xs tracking-[0.15em] text-foreground/80 group-hover:text-accent transition-colors uppercase">
            Read Article
            <svg 
              className="ms-2 w-4 h-4 rtl:-scale-x-100 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" 
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
