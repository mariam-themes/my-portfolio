'use client';

import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  _id: string;
  slug: string;
  title: string;
  category?: string;
  sector?: string; // fallback if category is empty for legacy projects
  heroMediaUrl: string;
  year: number;
  isFeatured?: boolean;
}

export type ProjectRecord = Project;

export default function ProjectListClient({ projects, featuredOnly = false }: { projects: Project[]; featuredOnly?: boolean }) {
  const locale = useLocale();
  const t = useTranslations('Work');
  const [activeFilter, setActiveFilter] = useState<string>('');
  
  // Custom Cursor State
  const [isHovering, setIsHovering] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Drive the custom cursor via refs + rAF so mouse movement does not rerender the grid.
  useEffect(() => {
    const updateCursor = () => {
      const el = cursorRef.current;
      if (!el) return;
      const { x, y } = mouseRef.current;
      el.style.transform = `translate(${x - 50}px, ${y - 50}px) scale(${isHovering ? 1 : 0.5})`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          updateCursor();
        });
      }
    };

    updateCursor();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [isHovering]);


  // Extract unique categories — only show user-created categories, hide system placeholders
  const hiddenCats = new Set(['uncategorized', 'selected project', 'selected projects']);
  const categories = Array.from(
    new Set(
      projects
        .map((p) => p.category || p.sector)
        .filter(Boolean)
        .filter((cat) => !hiddenCats.has((cat as string).trim().toLowerCase()))
    )
  ) as string[];
  
  const filteredProjects = useMemo(() => {
    return activeFilter === ''
      ? projects
      : projects.filter(p => (p.category || p.sector) === activeFilter);
  }, [projects, activeFilter]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.project-card');
      
      if (cards.length > 0) {
        gsap.fromTo(cards, 
          { y: 100, autoAlpha: 0 },
          { 
            y: 0, 
            autoAlpha: 1, 
            duration: 0.9, 
            stagger: 0.15, 
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
            }
          }
        );
      }
    }, containerRef);
    
    return () => ctx.revert();
  }, [filteredProjects]);

  return (
    <div className="min-h-screen pb-32 bg-[#0a0507] text-white overflow-x-clip relative">
      
      {/* ── CUSTOM HOVER CURSOR ── */}
      <div 
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center rounded-full text-white font-bold text-[10px] tracking-widest uppercase transition-opacity duration-300 will-change-transform"
        style={{
          backgroundColor: 'rgba(149, 28, 48, 0.9)', // #951C30 with 90% opacity
          width: '100px',
          height: '100px',
          opacity: isHovering ? 1 : 0,
          transition: 'opacity 0.3s ease-out, width 0.3s, height 0.3s',
        }}
      >
        <span className="text-center leading-tight">{t('viewProject') || 'View'}</span>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 pt-32 pb-16">
        
        {/* ── HEADER & FILTERS ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          
          {/* Header Typography */}
          <div className="lg:w-1/2">
            {featuredOnly && (
              <div className="flex items-center gap-4 text-xs tracking-[0.2em] rtl:tracking-normal uppercase text-accent mb-4">
                <span className="w-12 h-[1px] bg-accent/50" />
                {t('featuredKicker')}
              </div>
            )}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              <span className="text-white block">{t('headingTop')}</span>
              <span className="block mt-2" style={{ color: '#951C30' }}>{t('headingBottom')}</span>
            </h1>
          </div>
          
          {/* Filters (Pills style) */}
          <div className="lg:w-1/2 flex flex-wrap items-center lg:justify-end gap-3">
            {/* "All" pill */}
            <button
              onClick={() => setActiveFilter('')}
              className={`
                px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300
                ${activeFilter === ''
                  ? 'text-white border-transparent'
                  : 'bg-transparent text-white/60 border border-white/20 hover:border-white/50 hover:text-white'}
              `}
              style={{
                borderWidth: '1px',
                backgroundColor: activeFilter === '' ? '#951C30' : 'transparent'
              }}
            >
              {t('all')}
            </button>
            {categories.map(category => {
              const isActive = activeFilter === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`
                    px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300
                    ${isActive 
                      ? 'text-white border-transparent' 
                      : 'bg-transparent text-white/60 border border-white/20 hover:border-white/50 hover:text-white'}
                  `}
                  style={{ 
                    borderWidth: '1px',
                    backgroundColor: isActive ? '#951C30' : 'transparent'
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>

        </div>

        {/* ── GRID LAYOUT ── */}
        <div 
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start"
        >
          {filteredProjects.map((project, i) => {
            // Masonry staggered effect: push right column down
            const isRightColumn = i % 2 !== 0;
            
            return (
              <Link 
                key={String(project._id ?? project.slug ?? `proj-${i}`)}
                href={`/projects/${project.slug}`} 
                className={`project-card block group ${isRightColumn ? 'md:mt-32' : ''}`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => { try { sessionStorage.setItem('caseStudyRef', '/work'); } catch {} }}
                // We use cursor-none to hide the default pointer since we have a custom follower
                style={{ cursor: 'none' }}
              >
                {/* Image Container */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden bg-[#111]">
{project.heroMediaUrl ? (
                      <Image
                        src={project.heroMediaUrl}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 font-light">
                      {t('noImage')}
                    </div>
                  )}
                  {/* Subtle Dark Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
                  
                  {/* Featured Badge on Image */}
                  {project.isFeatured && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#951C30] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-lg">
                        <Star className="h-3 w-3 fill-white" />
                        {t('featured') || 'Featured'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Project Meta Info */}
                <div className="mt-6 flex flex-col gap-2">
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
                    {project.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.15em] text-white/50">
                    <span>{project.category || project.sector || t('design')}</span>
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#951C30', opacity: 0.8 }} />
                    <span>{project.year}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-40 text-white/30 font-light text-xl">
            {t('noProjectsInCategory')}
          </div>
        )}
      </div>
    </div>
  );
}
