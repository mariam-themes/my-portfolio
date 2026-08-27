'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { resolveText, type LocalizedProject } from '@/lib/localizeProject';
import { useReducedMotion } from 'framer-motion'; 
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function ProjectsPreviewSection() {
  const locale        = useLocale();
  const t             = useTranslations('ProjectsPreview');
  const prefersReduced = useReducedMotion() ?? false;

  const [projects,    setProjects]    = useState<LocalizedProject[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // The wrapper that will be pinned
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        // "Selected Projects" = a curated showcase of the latest projects.
        // (Featured projects get their own dedicated section.)
        const res = await fetch('/api/projects');
        const json = await res.json();
        if (json.success) setProjects(json.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  useGSAP(() => {
    if (loading || !projects.length || prefersReduced) return;

    let mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray('.project-card') as HTMLElement[];
      const total = cards.length;
      if (total === 0) return;

      // Reset initial states
      gsap.set(cards, { yPercent: 100, pointerEvents: 'none' });
      gsap.set(cards[0], { yPercent: 0, pointerEvents: 'auto' });

      const pauseDuration = 0.3; 
      const totalDuration = (total - 1) + pauseDuration;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          // NO GSAP PINNING! We use native CSS sticky.
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress * totalDuration;
            let current = Math.floor(progress + 0.5);
            if (current >= total) current = total - 1;
            setActiveIndex(current);
          }
        }
      });

      if (total > 1) {
        cards.forEach((card: any, index) => {
          if (index > 0) {
            tl.to(card, { yPercent: 0, pointerEvents: 'auto', duration: 1, ease: 'none' }, `transition${index}`);
            tl.to(cards[index - 1], { yPercent: -30, pointerEvents: 'none', duration: 1, ease: 'none' }, `transition${index}`);
          }
        });
      }

      tl.to({}, { duration: pauseDuration });

      setTimeout(() => ScrollTrigger.refresh(), 200);
    });

    return () => mm.revert();
  }, { scope: containerRef, dependencies: [projects, prefersReduced, loading] });

  // Handle language switch gracefully and fix Lenis height calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      window.dispatchEvent(new Event('resize')); // Force Lenis to recalculate document height
    }, 300);
    return () => clearTimeout(timer);
  }, [locale, loading, projects.length]);

  // Calculate total height for the sticky wrapper. 
  // Each project gets 100vh of scroll distance.
  const totalProjects = projects.length || 1;
  const stickyHeight = !prefersReduced && !loading && totalProjects > 1 
    ? `${totalProjects * 100}vh` 
    : 'auto';

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: stickyHeight }}>
      <section 
        ref={sectionRef} 
        className="sticky top-0 z-10 bg-[#0a0507] h-screen flex flex-col overflow-hidden"
      >
        {/* ── Section header ── */}
        <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-20 pt-24 md:pt-32 pb-6 shrink-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-4xl text-start">
              <div className="flex items-center gap-4 text-xs tracking-[0.2em] rtl:tracking-normal uppercase text-accent mb-4">
                <span className="w-12 h-[1px] bg-accent/50" />
                {t('kicker')}
              </div>
              <h2 className="text-5xl md:text-7xl font-serif font-normal text-foreground leading-tight">
                {t('title')}{' '}
                <span className="italic" style={{ color: '#951C30' }}>
                  {t('titleAccent')}
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-pulse flex gap-2">
              <div className="w-3 h-3 bg-[#951C30] rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-[#951C30] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-3 h-3 bg-[#951C30] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        ) : projects.length === 0 ? (
          /* ── Empty ── */
          <div className="flex-1 container mx-auto px-6 md:px-12 lg:px-20 pb-24">
            <div className="text-center text-slate-500 py-12 border border-white/10 rounded-xl">
              {t('noProjects')}
            </div>
          </div>
        ) : prefersReduced ? (
          /* ── Reduced Motion ── */
          <div className="flex-1 flex flex-col gap-24 pb-24 overflow-y-auto">
            {projects.map((project, index) => (
              <div key={project._id as string} className="relative w-full min-h-[60vh]">
                 <ProjectCard project={project} index={index} total={projects.length} activeIndex={index} locale={locale} t={t} isActive={true} />
              </div>
            ))}
          </div>
        ) : (
          /* ── GSAP Showcase ── */
          <div className="flex-1 relative w-full overflow-hidden">
            {projects.map((project, index) => (
              <div 
                key={project._id as string} 
                className="project-card absolute inset-0 w-full h-full bg-[#0d0507] overflow-hidden rounded-t-[2rem] lg:rounded-t-[3rem] shadow-[0_-15px_50px_rgba(0,0,0,0.5)] border-t border-white/5"
              >
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#21060e] via-[#0d0507] to-[#180307]" />
                  <div 
                    className="absolute bg-[#951C30] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.15]"
                    style={{
                      width: '50vw', height: '50vw',
                      top: index % 2 === 0 ? '-10%' : 'auto',
                      bottom: index % 2 !== 0 ? '-10%' : 'auto',
                      left: index % 2 === 0 ? '-10%' : 'auto',
                      right: index % 2 !== 0 ? '-10%' : 'auto',
                    }}
                  />
                </div>
                <div className="relative z-10 w-full h-full">
                  <ProjectCard project={project} index={index} total={projects.length} activeIndex={activeIndex} locale={locale} t={t} isActive={activeIndex === index} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProjectCard({ project, index, total, activeIndex, locale, t, isActive }: any) {
  const title    = resolveText(project.title,    project, 'title',    'en');
  const category = resolveText(project.category, project, 'category', locale);
  const sector   = resolveText(project.sector,   project, 'sector',   locale);
  const num      = String(index + 1).padStart(2, '0');
  const isLast   = index === total - 1;
  const isEven   = index % 2 === 0;

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 lg:p-12 gap-8 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
      <div className="relative w-full h-[45vh] lg:h-full lg:w-[50%] shrink-0 flex items-center justify-center">
        {project.heroMediaUrl ? (
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_2rem_5rem_rgba(0,0,0,0.5)] border border-white/5">
            <Image src={project.heroMediaUrl as string} alt={title || `Project ${num}`} fill className="object-cover" unoptimized priority={index === 0} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 font-light">{t('noImage')}</div>
        )}
        <div className="absolute inset-0 pointer-events-none hidden lg:block" style={{ background: 'linear-gradient(to right, transparent 70%, rgba(13,5,7,0.3))' }} />
        <span aria-hidden className="absolute -bottom-4 -left-2 rtl:-left-auto rtl:-right-2 lg:-bottom-6 lg:-left-6 rtl:lg:-left-auto rtl:lg:-right-6 font-serif font-extrabold text-white/[0.04] leading-none select-none pointer-events-none drop-shadow-2xl" style={{ fontSize: 'clamp(5rem, 14vw, 12rem)' }}>
          {num}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 py-8 lg:px-8 lg:py-12 gap-5 lg:gap-8 relative">
        <div className="flex items-center gap-3 text-[10px] rtl:text-xs font-bold uppercase tracking-[0.22em] rtl:tracking-normal text-white/40">
          <span>{category || sector || t('design')}</span>
          <span className="w-1 h-1 rounded-full bg-[#951C30]/70 shrink-0" aria-hidden />
          <span>{project.year as string | number}</span>
        </div>
        <h3 className="font-serif font-normal leading-[1.08] tracking-[-0.02em] rtl:tracking-normal text-white" style={{ fontSize: 'clamp(1.8rem, 4vw, 3.25rem)' }}>
          {title}
        </h3>
        <Link href={`/work/${project.slug as string}`} className="group/cta inline-flex items-center gap-3 w-fit mt-1" tabIndex={isActive ? 0 : -1}>
          <span className="block h-px w-8 bg-[#951C30] transition-[width] duration-500 group-hover/cta:w-14" />
          <span className="text-[11px] rtl:text-xs font-bold uppercase tracking-[0.18em] rtl:tracking-normal text-white/55 group-hover/cta:text-white transition-colors duration-300">{t('viewProject')}</span>
          <span className="text-[#951C30] text-sm transition-transform duration-300 group-hover/cta:translate-x-1.5 rtl:group-hover/cta:-translate-x-1.5 rtl:-scale-x-100 block">→</span>
        </Link>
        <div className="flex items-center gap-2 mt-2" aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`block rounded-full transition-all duration-500 ${i === activeIndex ? 'w-7 h-[5px] bg-[#951C30]' : 'w-[5px] h-[5px] bg-white/15'}`} />
          ))}
        </div>
        {isLast && (
          <div className="mt-4 transition-all duration-500" style={{ opacity: isActive ? 1 : 0, transform: `translateY(${isActive ? 0 : '10px'})` }} aria-hidden={!isActive}>
            <Link href="/work" tabIndex={isActive ? 0 : -1} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-sm font-semibold tracking-widest uppercase text-white hover:bg-[#951C30] hover:border-[#951C30] hover:text-white transition-all duration-300">
              {t('seeAll')}
              <span aria-hidden className="rtl:-scale-x-100 block">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
