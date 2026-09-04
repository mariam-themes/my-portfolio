import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { NextProject } from '@/types/case-study';
import { Media } from './Shared';

export function ClosingSection({
  images,
  singleUrl,
  title,
  reducedMotion,
}: {
  images?: string[] | null;
  singleUrl?: string;
  title: string;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || reducedMotion) return;
    const context = gsap.context(() => {
      const items = Array.from(root.querySelectorAll<HTMLElement>('[data-closing-item]'));
      gsap.fromTo(
        items,
        { y: 70, autoAlpha: 0, scale: 0.97 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 1.15,
          ease: 'power3.out',
          stagger: 0.2,
          scrollTrigger: { trigger: root, start: 'top 80%', once: true },
        }
      );
    }, root);
    return () => context.revert();
  }, [reducedMotion, images, singleUrl]);

  if (images && images.length > 0) {
    const isTwo = images.length === 2;
    const isOne = images.length === 1;
    
    return (
      <div 
        ref={ref} 
        className={
          isOne 
            ? 'block' 
            : isTwo 
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
              : 'grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[300px] grid-flow-dense'
        }
      >
        {images.map((url, i) => {
          let spanClass = '';
          if (isOne) {
            spanClass = 'aspect-[21/9] w-full';
          } else if (isTwo) {
            spanClass = 'aspect-[16/10] w-full';
          } else {
            const cycle = i % 6;
            if (cycle === 0) spanClass = 'md:col-span-2 md:row-span-2';
            else if (cycle === 1) spanClass = 'md:col-span-1 md:row-span-1';
            else if (cycle === 2) spanClass = 'md:col-span-1 md:row-span-1';
            else if (cycle === 3) spanClass = 'md:col-span-1 md:row-span-2';
            else if (cycle === 4) spanClass = 'md:col-span-2 md:row-span-1';
            else if (cycle === 5) spanClass = 'md:col-span-3 md:row-span-1 aspect-[21/9]';
          }

          return (
            <div
              key={i}
              data-closing-item
              data-parallax={!isOne}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#1c060f] ${spanClass} ${!isOne && !isTwo ? 'h-full w-full' : ''}`}
            >
              <Media item={{ url, type: 'desktop' }} alt={`${title} — closing ${i + 1}`} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-inset ring-0 transition-all duration-500 group-hover:ring-1 group-hover:ring-[#951C30]/35" />
            </div>
          );
        })}
      </div>
    );
  }

  if (singleUrl) {
    return (
      <div ref={ref}>
        <div
          data-closing-item
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#1c060f] aspect-[21/9]"
        >
          <div className="closing-ken-burns absolute inset-0">
            <Media item={{ url: singleUrl, type: 'desktop' }} alt={`${title} — final preview`} />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-inset ring-0 transition-all duration-500 group-hover:ring-1 group-hover:ring-[#951C30]/35" />
        </div>
      </div>
    );
  }

  return null;
}

export function NextProjectTeaser({ next }: { next: NextProject }) {
  const t = useTranslations('CaseStudy');
  return (
    <div className="group/teaser relative border-t border-white/5">
      <div className="absolute top-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#951C30] via-[#c4243c] to-[#951C30] transition-transform duration-700 ease-out group-hover/teaser:scale-x-100" />

      <Link
        href={`/work/${next.slug}`}
        className="relative flex min-h-[48vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
        aria-label={`Next project: ${next.title}`}
      >
        {next.heroMediaUrl && (
          <div className="pointer-events-none absolute inset-0 scale-[1.1] transition-transform duration-[1200ms] ease-out group-hover/teaser:scale-100">
            <Image
              src={next.heroMediaUrl}
              alt=""
              fill
              unoptimized
              className="object-cover opacity-10 transition-opacity duration-700 group-hover/teaser:opacity-[0.22]"
            />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[#0b0107]/82 transition-opacity duration-700 group-hover/teaser:bg-[#0b0107]/55" />

        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover/teaser:opacity-100 [background:radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(149,28,48,0.18),transparent)]" />

        <div className="relative z-10">
          <p className="mb-4 text-[9px] font-bold uppercase tracking-[.55em] text-[var(--accent)] opacity-60 transition-opacity duration-300 group-hover/teaser:opacity-100">
            {t('nextProject')}
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-white transition-all duration-500 group-hover/teaser:-translate-y-1 group-hover/teaser:tracking-wide sm:text-5xl">
            {next.title}
          </h3>
          {(next.sector || next.year) && (
            <p className="mt-2 text-xs text-white/30 transition-colors duration-300 group-hover/teaser:text-white/55">
              {[next.sector, next.year].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.35em] text-white/40 transition-colors duration-300 group-hover/teaser:text-white">
            <span className="relative">
              {t('viewCaseStudy')}
              <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 group-hover/teaser:scale-x-100" />
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/teaser:translate-x-0.5 group-hover/teaser:-translate-y-0.5" />
          </div>
        </div>
      </Link>
    </div>
  );
}
