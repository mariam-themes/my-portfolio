'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { type LocalizedProject } from '@/lib/localizeProject';
import { resolveText } from '@/lib/localizeProject';
import PurchaseModal from './PurchaseModal';

const MAX_VISIBLE = 4;

interface SaleProject extends LocalizedProject {
  price?: number;
  currency?: string;
  isForSale?: boolean;
}

export default function VisualIdentitiesForSaleSection() {
  const t = useTranslations('VisualIdentitiesForSale');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const shouldReduceMotion = useReducedMotion();

  const [projects, setProjects] = useState<SaleProject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [modalProject, setModalProject] = useState<SaleProject | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSaleProjects() {
      try {
        const res = await fetch('/api/projects?forSale=true');
        const json = await res.json();
        if (cancelled || !json.success) return;
        setTotal(json.data.length);
        setProjects(json.data.slice(0, MAX_VISIBLE));
      } catch (err) {
        console.error('Failed to fetch sale projects:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSaleProjects();
    return () => { cancelled = true; };
  }, []);

  const goNext = useCallback(() => {
    setDirection('next');
    setActiveIndex((i) => (i + 1) % projects.length);
  }, [projects.length]);

  const goPrev = useCallback(() => {
    setDirection('prev');
    setActiveIndex((i) => (i - 1 + projects.length) % projects.length);
  }, [projects.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') isRtl ? goPrev() : goNext();
      if (e.key === 'ArrowLeft') isRtl ? goNext() : goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, isRtl]);

  if (!loading && projects.length === 0) return null;

  const activeProject = projects[activeIndex];

  return (
    <section
      className="relative py-20 md:py-28 lg:py-36 overflow-hidden"
      id="visual-identities-for-sale"
      aria-label={t('pageTitle')}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#951C30]/8 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[80px]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 md:mb-20"
        >
          {/* Kicker */}
          <div className="flex items-center justify-center gap-4 text-xs tracking-[0.2em] uppercase text-amber-400/80 mb-5 font-semibold">
            <span className="w-10 h-px bg-amber-400/30" />
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              {t('kicker')}
            </span>
            <span className="w-10 h-px bg-amber-400/30" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white leading-tight">
            {t('title')}{' '}
            <span className="italic" style={{ color: '#951C30' }}>
              {t('titleAccent')}
            </span>
          </h2>

          <p className="mt-4 max-w-lg mx-auto text-white/45 font-light leading-relaxed text-sm md:text-base">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Cards Area */}
        {loading ? (
          <SkeletonStack />
        ) : projects.length > 0 ? (
          <div className="flex flex-col items-center gap-10">
            {/* 3D Stack */}
            <div
              className="relative w-full max-w-sm md:max-w-md mx-auto"
              style={{ height: '480px' }}
              aria-live="polite"
            >
              {/* Background stacked cards (decorative) */}
              {projects.length > 1 && (
                <div
                  className="absolute inset-0 rounded-[1.75rem] border border-white/5 bg-white/[0.01]"
                  style={{ transform: 'translateY(20px) translateX(12px) scale(0.93)', zIndex: 1 }}
                />
              )}
              {projects.length > 2 && (
                <div
                  className="absolute inset-0 rounded-[1.75rem] border border-white/5 bg-white/[0.01]"
                  style={{ transform: 'translateY(10px) translateX(6px) scale(0.965)', zIndex: 2 }}
                />
              )}

              {/* Active card */}
              <AnimatePresence mode="wait" custom={direction}>
                {activeProject && (
                  <motion.div
                    key={`${activeProject.slug}-${activeIndex}`}
                    custom={direction}
                    variants={cardVariants(isRtl, shouldReduceMotion ?? false)}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 z-10"
                  >
                    <SaleCard
                      project={activeProject}
                      locale={locale}
                      t={t}
                      onBuy={() => setModalProject(activeProject)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            {projects.length > 1 && (
              <div className="flex items-center gap-5">
                <button
                  onClick={isRtl ? goNext : goPrev}
                  aria-label={t('prev')}
                  className="p-3 rounded-full border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-[#951C30]/50 hover:bg-[#951C30]/10 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="flex items-center gap-2">
                  {projects.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > activeIndex ? 'next' : 'prev');
                        setActiveIndex(i);
                      }}
                      aria-label={`Go to identity ${i + 1}`}
                      className={`transition-all duration-300 rounded-full ${
                        i === activeIndex
                          ? 'w-6 h-2 bg-[#951C30]'
                          : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={isRtl ? goPrev : goNext}
                  aria-label={t('next')}
                  className="p-3 rounded-full border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-[#951C30]/50 hover:bg-[#951C30]/10 transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* View All CTA */}
            {total > 0 && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link
                  href="/marketplace"
                  className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-white/70 transition-all duration-300 hover:border-[#951C30]/50 hover:text-white hover:bg-[#951C30]/10 hover:-translate-y-0.5"
                >
                  {t('viewAll')}
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5 rtl:group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            )}
          </div>
        ) : null}
      </div>

      {/* Purchase Modal */}
      {modalProject && (
        <PurchaseModal
          isOpen={!!modalProject}
          onClose={() => setModalProject(null)}
          projectTitle={resolveText(modalProject.title, modalProject, 'title', locale) || ''}
          projectSlug={String(modalProject.slug || '')}
          price={modalProject.price ?? 0}
          currency={modalProject.currency ?? 'SAR'}
        />
      )}
    </section>
  );
}

// ─── Card Variants ────────────────────────────────────────────────────────────
function cardVariants(isRtl: boolean, reduced: boolean) {
  if (reduced) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    enter: (dir: 'next' | 'prev') => ({
      x: dir === 'next' ? (isRtl ? -80 : 80) : (isRtl ? 80 : -80),
      opacity: 0,
      rotateY: dir === 'next' ? (isRtl ? -12 : 12) : (isRtl ? 12 : -12),
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
    },
    exit: (dir: 'next' | 'prev') => ({
      x: dir === 'next' ? (isRtl ? 80 : -80) : (isRtl ? -80 : 80),
      opacity: 0,
      rotateY: dir === 'next' ? (isRtl ? 12 : -12) : (isRtl ? -12 : 12),
      scale: 0.9,
    }),
  };
}

// ─── Individual Sale Card ─────────────────────────────────────────────────────
function SaleCard({
  project,
  locale,
  t,
  onBuy,
}: {
  project: SaleProject;
  locale: string;
  t: (key: string) => string;
  onBuy: () => void;
}) {
  const title = resolveText(project.title, project, 'title', locale) || '';
  const description = resolveText(project.description, project, 'description', locale) || '';
  const media = (project.heroMediaUrl as string) || '';
  const formattedPrice = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(project.price ?? 0);

  return (
    <div className="group relative h-full w-full rounded-[1.75rem] overflow-hidden border border-white/10 bg-[#0e0608] shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col">
      {/* Image */}
      <div className="relative flex-1 overflow-hidden">
        {media ? (
          <Image
            src={media}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#1a0a14] text-white/20 text-sm">
            No Image
          </div>
        )}

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e0608] via-[#0e0608]/30 to-transparent" />

        {/* Price badge */}
        <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 flex items-center gap-1.5 rounded-full bg-amber-500/90 backdrop-blur-sm px-3.5 py-1.5 shadow-lg">
          <span className="text-sm font-bold text-amber-950">
            {formattedPrice}
          </span>
          <span className="text-xs font-semibold text-amber-900">
            {project.currency ?? 'SAR'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 flex flex-col gap-3">
        <div>
          <h3 className="text-lg md:text-xl font-serif font-normal text-white leading-tight line-clamp-1">
            {title}
          </h3>
          {description && (
            <p className="mt-1.5 text-sm text-white/45 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Price under description */}
          <div className="mt-3.5 pt-3 border-t border-white/5 flex items-baseline justify-between">
            <span className="text-xs text-white/40 uppercase tracking-wider font-medium">
              {locale === 'ar' ? 'السعر' : 'Price'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl md:text-2xl font-bold font-mono text-amber-400 tracking-tight drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]">
                {formattedPrice}
              </span>
              <span className="text-xs font-semibold text-amber-300/80">
                {project.currency ?? 'SAR'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          {/* Glowing chic Purchase Button */}
          <div className="relative flex-1 group/btn">
            {/* Glowing animated halo */}
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500/40 via-rose-500/50 to-amber-500/40 blur-[6px] opacity-75 group-hover/btn:opacity-100 animate-pulse transition duration-500" />

            <button
              onClick={onBuy}
              id={`buy-btn-${project.slug}`}
              className="relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#951C30] via-[#be2542] to-[#7a1628] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(194,40,69,0.35)] transition-all duration-300 group-hover/btn:shadow-[0_0_25px_rgba(251,191,36,0.55)] group-hover/btn:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              {/* Shine streak across button */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
              <ShoppingBag className="w-4 h-4 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              <span className="relative z-10 drop-shadow-sm">{t('buyNow')}</span>
            </button>
          </div>

          <Link
            href={`/work/${project.slug as string}`}
            className="flex items-center justify-center p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 transition-colors"
            aria-label={`View ${title}`}
          >
            <ArrowUpRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      </div>

      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_0_1px_rgba(149,28,48,0.3)]" />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonStack() {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="relative w-full max-w-sm md:max-w-md mx-auto" style={{ height: '480px' }}>
        <div
          className="absolute inset-0 rounded-[1.75rem] border border-white/5 bg-white/[0.01]"
          style={{ transform: 'translateY(20px) translateX(12px) scale(0.93)' }}
        />
        <div
          className="absolute inset-0 rounded-[1.75rem] border border-white/5 bg-white/[0.01]"
          style={{ transform: 'translateY(10px) translateX(6px) scale(0.965)' }}
        />
        <div className="absolute inset-0 rounded-[1.75rem] border border-white/10 bg-white/[0.02] animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent rounded-[1.75rem]" />
        </div>
      </div>
    </div>
  );
}
