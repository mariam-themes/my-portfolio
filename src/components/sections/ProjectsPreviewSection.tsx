'use client';

import { useEffect, useLayoutEffect, useRef, useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { resolveText, type LocalizedProject } from '@/lib/localizeProject';
import { formatPortfolioNumber } from '@/lib/formatters';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useRouter } from '@/i18n/navigation';
import { ArrowUpRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Detect the ACTUAL device, not just viewport width.
// Touch devices / coarse pointers (phones, tablets) should always get the
// vertical stack — even when "Desktop Site" makes the viewport wide.
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isTouch;
}

export default function ProjectsPreviewSection() {
  const locale = useLocale();
  const t = useTranslations('ProjectsPreview');
  const prefersReduced = useReducedMotion() ?? false;
  const router = useRouter();
  const isTouch = useIsTouchDevice();
  const isRtl = locale === 'ar';

  const [projects, setProjects] = useState<LocalizedProject[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // For RTL: reverse projects so first project (index 0) appears at track start (right edge in RTL viewport)
  const displayProjects = isRtl ? [...projects].reverse() : projects;
  const total = displayProjects.length;

  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);

  const openProject = useCallback((slug: string) => {
    router.push(`/work/${slug}`);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const json = await res.json();
        if (cancelled || !json.success) return;
        setTotalCount(json.data.length);
        setProjects(json.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProjects();
    return () => { cancelled = true; };
  }, []);

  // useLayoutEffect for GSAP scroll trigger - MUST be before any early returns
  // to maintain stable hook order. The effect itself returns early if conditions aren't met.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || loading || !displayProjects.length) return;

    // Touch device OR reduced motion => vertical stack, no pin.
    if (prefersReduced || isTouch) {
      document.body.classList.add('no-pin');
      return;
    }

    const mm = gsap.matchMedia();
    mm.add('(min-width: 861px) and (hover: hover) and (pointer: fine)', () => {
      // Calculate actual scrollable distance: track content width minus viewport width
      const getDistance = () => {
        const trackWidth = track.scrollWidth;
        const viewportWidth = track.parentElement?.clientWidth ?? window.innerWidth;
        return Math.max(0, trackWidth - viewportWidth);
      };

      gsap.to(track, {
        x: () => (isRtl ? getDistance() : -getDistance()),
        ease: 'none',
        scrollTrigger: {
          trigger: '#workPinWrap',
          start: 'top top',
          end: () => '+=' + getDistance(),
          pin: true,
          scrub: 0.9,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate(self) {
            if (fillRef.current) fillRef.current.style.transform = `scaleX(${self.progress})`;
            const idx = Math.min(total - 1, Math.floor(self.progress * total));
            const shown = idx + 1; // Logical index is the same regardless of RTL because scroll progress matches logical project order
            
            const shownStr = formatPortfolioNumber(shown, locale);
            if (currentRef.current && currentRef.current.textContent !== shownStr) {
              currentRef.current.textContent = shownStr;
            }
          },
        },
      });
    });
    return () => mm.revert();
  }, [loading, displayProjects.length, prefersReduced, isTouch, total, isRtl]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 lg:py-32 bg-[#0a0507] relative">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="py-16 md:py-24 lg:py-32 bg-[#0a0507] relative">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center text-white/40">{t('noProjects')}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="work py-16 md:py-24 lg:py-32" id="work" aria-label="Selected work">
      <div id="workPinWrap" className="work__pin-wrap">
        <header className="work__head flex flex-col items-start container mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-[#951C30] font-semibold mb-4 rtl:tracking-normal w-fit">
            <span className="w-12 h-[1px] bg-[#951C30]/50" />
            {locale === 'ar' ? 'المشاريع' : 'PROJECTS'}
            <span className="w-12 h-[1px] bg-[#951C30]/50" />
          </div>
          
          <h2 className="sec-title text-4xl md:text-5xl lg:text-6xl font-serif font-normal leading-[0.9] text-white">
            <span className="block overflow-hidden">
              <span className="block">
                {t('title')}{' '}
                <span className="italic" style={{ color: '#951C30' }}>
                  {t('titleAccent')}
                </span>
              </span>
            </span>
          </h2>
          
          {(() => {
            const scrollHintStr = t('scrollHint');
            const arrowChar = scrollHintStr.includes('→') ? '→' : scrollHintStr.includes('←') ? '←' : '';
            let scrollPart = scrollHintStr;
            let clickPart = '';
            
            if (arrowChar) {
              const parts = scrollHintStr.split(arrowChar);
              scrollPart = parts[0].trim();
              clickPart = parts[1].trim();
            }

            return (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="mono text-xs tracking-widest text-white/40 uppercase">
                  {scrollPart}
                </span>
                {arrowChar && (
                  <span className="text-white/30">{arrowChar}</span>
                )}
                {clickPart && (
                  <span className="mono text-xs tracking-widest text-white/90 font-bold uppercase relative inline-flex items-center px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.03)]">
                    <span className="absolute -inset-1 bg-[#951C30]/20 blur-md rounded-full animate-pulse"></span>
                    <span className="relative">{clickPart}</span>
                  </span>
                )}
              </div>
            );
          })()}
        </header>

        <div className="work__viewport">
          <div ref={trackRef} id="workTrack" className="work__track" dir="ltr">
            {displayProjects.map((p, i) => {
              const logicalIndex = isRtl ? total - 1 - i : i;
              return (
                <ProjectCard key={String(p._id ?? p.slug ?? `p-${i}`)} project={p} index={logicalIndex} total={total} locale={locale} t={t} onOpen={openProject} />
              );
            })}
          </div>

          <footer className="work__progress" aria-hidden="true">
            <span className="mono" ref={currentRef}>
              {formatPortfolioNumber(1, locale)}
            </span>
            <div className="work__bar"><span ref={fillRef}></span></div>
            <span className="mono">
              {formatPortfolioNumber(total, locale)}
            </span>
          </footer>
        </div>
      </div>

      {totalCount > 4 && (
        <div className="relative z-10 flex justify-center py-16 bg-[#0a0507]">
          <Link
            href="/work"
            className="group inline-flex items-center gap-3 rounded-full bg-[#951C30] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-rose-900/30 transition-all duration-300 hover:bg-[#b8223b] hover:shadow-rose-800/40 hover:-translate-y-0.5"
          >
            {t('seeAll')}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>
      )}
    </section>
  );
}

const ProjectCard = memo(function ProjectCard({ project, index, total, locale, t, onOpen }: { project: LocalizedProject; index: number; total: number; locale: string; t: (key: string) => string; onOpen: (slug: string) => void }) {
  const title = resolveText(project.title, project, 'title', locale);
  const category = resolveText(project.category, project, 'category', locale);
  const sector = resolveText(project.sector, project, 'sector', locale);
  
  const isRtl = locale === 'ar';
  const num = formatPortfolioNumber(index + 1, locale);
  const totalStr = formatPortfolioNumber(total, locale);

  return (
    <article data-project-card data-index={index} className="project">
      <div className="project__meta-row">
        <span className="mono">
          <b className="text-[#951C30]">{num}</b>&nbsp;/&nbsp;{totalStr}
        </span>
        <span className="mono">
          {category || sector || t('design')}{project.year ? `\u00A0\u00A0·\u00A0\u00A0${project.year}` : ''}
        </span>
      </div>

      <figure data-project-visual className="project__visual">
        {project.heroMediaUrl ? (
          <Image src={project.heroMediaUrl as string} alt={title} fill sizes="56vw" className="project__image" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/20">{t('noImage')}</div>
        )}
      </figure>

      <button
        data-cursor="view"
        aria-label={`Open ${title}`}
        onClick={() => onOpen(project.slug as string)}
        className="project__open"
      />

      <figcaption className="project__caption">
        <h3 className="project__name">{title}</h3>
        <p className="project__outcome">
          {resolveText(project.description, project, 'description', locale)?.slice(0, 120)}
        </p>
      </figcaption>
    </article>
  );
});
