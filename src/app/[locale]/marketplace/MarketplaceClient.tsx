'use client';

import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PurchaseModal from '@/components/sections/PurchaseModal';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface MarketplaceProject {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  sector?: string;
  rawCategory?: string;
  heroMediaUrl: string;
  year: number;
  price: number;
  currency: string;
  isForSale?: boolean;
}

interface MarketplaceClientProps {
  projects: MarketplaceProject[];
  validCategories?: { name: string; label: string }[];
}

export default function MarketplaceClient({
  projects,
  validCategories = [],
}: MarketplaceClientProps) {
  const locale = useLocale();
  const t = useTranslations('VisualIdentitiesForSale');
  const isRtl = locale === 'ar';

  const [activeFilter, setActiveFilter] = useState<string>('');
  const [modalProject, setModalProject] = useState<MarketplaceProject | null>(null);

  // Custom Cursor
  const [isHovering, setIsHovering] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Extract categories dynamically from projects + match with validCategories
  const categories = useMemo(() => {
    const map = new Map<string, string>(); // canonicalKey -> displayLabel

    projects.forEach((p) => {
      const cat = (p.category || p.sector || '').trim();
      const raw = (p.rawCategory || '').trim();
      const target = cat || raw;
      if (!target) return;

      const matched = validCategories.find(
        (c) =>
          c.name.trim().toLowerCase() === target.toLowerCase() ||
          c.label.trim().toLowerCase() === target.toLowerCase() ||
          c.name.trim().toLowerCase() === raw.toLowerCase() ||
          c.label.trim().toLowerCase() === raw.toLowerCase()
      );

      if (matched) {
        map.set(matched.name.toLowerCase(), matched.label);
      } else {
        map.set(target.toLowerCase(), target);
      }
    });

    return Array.from(map.entries()).map(([name, label]) => ({
      name,
      label,
    }));
  }, [projects, validCategories]);

  // Filter projects by active category
  const filteredProjects = useMemo(() => {
    if (!activeFilter) return projects;
    const filterLower = activeFilter.trim().toLowerCase();

    return projects.filter((p) => {
      const cat = (p.category || p.sector || '').trim().toLowerCase();
      const raw = (p.rawCategory || '').trim().toLowerCase();

      const matchedValid = validCategories.find(
        (c) => c.name.toLowerCase() === filterLower
      );

      if (matchedValid) {
        const canonical = matchedValid.name.trim().toLowerCase();
        const localized = matchedValid.label.trim().toLowerCase();
        return (
          cat === canonical ||
          cat === localized ||
          raw === canonical ||
          raw === localized
        );
      }

      return cat === filterLower || raw === filterLower;
    });
  }, [projects, activeFilter, validCategories]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.marketplace-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 70, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [filteredProjects]);

  return (
    <div
      className="min-h-screen pb-32 bg-[#0a0507] text-white overflow-x-clip relative"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background ambient luxury glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#951C30]/8 blur-[160px]" />
        <div className="absolute right-0 bottom-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      {/* ── CUSTOM HOVER CURSOR ── */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center rounded-full text-white font-bold text-[10px] tracking-widest uppercase transition-opacity duration-300 will-change-transform"
        style={{
          backgroundColor: 'rgba(149, 28, 48, 0.9)',
          width: '100px',
          height: '100px',
          opacity: isHovering ? 1 : 0,
          transition: 'opacity 0.3s ease-out, width 0.3s, height 0.3s',
        }}
      >
        <span className="text-center leading-tight">
          {locale === 'ar' ? 'عرض' : 'View'}
        </span>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 pt-32 pb-16 relative z-10">
        {/* Back to Home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/50 hover:text-white transition-colors mb-10 group"
        >
          {isRtl ? (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          ) : (
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          )}
          <span>{locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
        </Link>

        {/* ── HEADER & CATEGORY FILTERS ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-10">
          {/* Header Typography */}
          <div className="lg:w-1/2">
            <div className="flex items-center gap-3 text-xs tracking-[0.2em] rtl:tracking-normal uppercase text-amber-400 mb-4 font-semibold">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>{t('kicker')}</span>
            </div>
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              <span className="text-white block">
                {locale === 'ar' ? 'هويات بصرية' : 'Visual Identities'}
              </span>
              <span className="block mt-2" style={{ color: '#951C30' }}>
                {locale === 'ar' ? 'للبيع.' : 'For Sale.'}
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-white/50 text-sm sm:text-base font-light leading-relaxed">
              {t('pageSubtitle')}
            </p>
          </div>

          {/* Filters (Pills style) */}
          <div className="lg:w-1/2 flex flex-wrap items-center lg:justify-end gap-3">
            {/* "All" pill */}
            <button
              onClick={() => setActiveFilter('')}
              className={`px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] rtl:tracking-normal uppercase transition-all duration-300 ${
                activeFilter === ''
                  ? 'text-white border-transparent'
                  : 'bg-transparent text-white/60 border border-white/20 hover:border-white/50 hover:text-white'
              }`}
              style={{
                borderWidth: '1px',
                backgroundColor: activeFilter === '' ? '#951C30' : 'transparent',
              }}
            >
              {t('filterAll') || (locale === 'ar' ? 'الكل' : 'All')}
            </button>

            {/* Dynamic Category Pills */}
            {categories.map((cat) => {
              const isActive = activeFilter === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveFilter(cat.name)}
                  className={`px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] rtl:tracking-normal uppercase transition-all duration-300 ${
                    isActive
                      ? 'text-white border-transparent'
                      : 'bg-transparent text-white/60 border border-white/20 hover:border-white/50 hover:text-white'
                  }`}
                  style={{
                    borderWidth: '1px',
                    backgroundColor: isActive ? '#951C30' : 'transparent',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2-COLUMN LUXURY MASONRY GRID ── */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start"
        >
          {filteredProjects.map((project, i) => {
            const isRightColumn = i % 2 !== 0;
            const formattedPrice = new Intl.NumberFormat(
              locale === 'ar' ? 'ar-SA' : 'en-US'
            ).format(project.price || 0);

            return (
              <div
                key={String(project._id ?? project.slug ?? `sale-${i}`)}
                className={`marketplace-card block group ${
                  isRightColumn ? 'md:mt-32' : ''
                }`}
              >
                {/* Large Image Container (same size as projects page) */}
                <Link
                  href={`/work/${project.slug}`}
                  className="block relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden bg-[#111] rounded-2xl sm:rounded-3xl border border-white/10 group-hover:border-[#951C30]/40 transition-all duration-500"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  style={{ cursor: 'none' }}
                >
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
                      {locale === 'ar' ? 'لا توجد صورة' : 'No Image'}
                    </div>
                  )}

                  {/* Dark subtle overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-700" />

                  {/* Price Badge on Image */}
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md border border-amber-500/40 px-3.5 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    <span className="text-xs sm:text-sm font-bold font-mono text-amber-300">
                      {formattedPrice}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-amber-400/80">
                      {project.currency || 'SAR'}
                    </span>
                  </div>

                  {/* Available badge on Image */}
                  <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {locale === 'ar' ? 'متاح للشراء' : 'Available'}
                    </span>
                  </div>
                </Link>

                {/* Project Meta Info & Actions */}
                <div className="mt-6 flex flex-col gap-3">
                  {/* Category and Year */}
                  <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.15em] rtl:tracking-normal text-white/50">
                    <span>
                      {project.category || project.sector || (locale === 'ar' ? 'هوية بصرية' : 'Brand Identity')}
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: '#951C30', opacity: 0.8 }}
                    />
                    <span>{project.year || new Date().getFullYear()}</span>
                  </div>

                  {/* Title */}
                  <Link href={`/work/${project.slug}`}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
                      {project.title}
                    </h2>
                  </Link>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm sm:text-base text-white/50 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Actions Row */}
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    {/* Glowing Purchase Button */}
                    <div className="relative group/buy">
                      <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500/40 via-rose-500/50 to-amber-500/40 blur-[4px] opacity-75 group-hover/buy:opacity-100 transition duration-300" />
                      <button
                        onClick={() => setModalProject(project)}
                        id={`marketplace-buy-${project.slug}`}
                        className="relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#951C30] via-[#be2542] to-[#7a1628] px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rtl:tracking-normal text-white shadow-[0_4px_25px_rgba(149,28,48,0.4)] transition-all duration-300 group-hover/buy:scale-[1.02] active:scale-[0.98] overflow-hidden"
                      >
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover/buy:translate-x-full" />
                        <ShoppingBag className="w-4 h-4 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                        <span className="relative z-10">{t('buyNow')}</span>
                        <span className="relative z-10 font-mono text-xs font-semibold text-amber-200/90 ms-1 px-2.5 py-0.5 rounded-full bg-black/40">
                          {formattedPrice} {project.currency || 'SAR'}
                        </span>
                      </button>
                    </div>

                    {/* View Details Link */}
                    <Link
                      href={`/work/${project.slug}`}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white/60 hover:text-white transition-colors py-3 px-5 rounded-full border border-white/10 hover:border-white/30 group/link"
                    >
                      <span>
                        {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      </span>
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 rtl:-scale-x-100" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-40 text-white/30 font-light text-xl">
            {t('noProjects') || (locale === 'ar' ? 'لا توجد هويات بصرية في هذه الفئة حالياً.' : 'No visual identities in this category.')}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {modalProject && (
        <PurchaseModal
          isOpen={!!modalProject}
          onClose={() => setModalProject(null)}
          projectTitle={modalProject.title}
          projectSlug={modalProject.slug}
          price={modalProject.price}
          currency={modalProject.currency}
        />
      )}
    </div>
  );
}
