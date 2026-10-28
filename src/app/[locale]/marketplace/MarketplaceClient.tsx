'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { type LocalizedProject } from '@/lib/localizeProject';
import { resolveText } from '@/lib/localizeProject';
import PurchaseModal from '@/components/sections/PurchaseModal';

interface SaleProject extends LocalizedProject {
  price?: number;
  currency?: string;
}

export default function MarketplaceClient() {
  const t = useTranslations('VisualIdentitiesForSale');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [projects, setProjects] = useState<SaleProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProject, setModalProject] = useState<SaleProject | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects?forSale=true');
        const json = await res.json();
        if (cancelled || !json.success) return;
        setProjects(json.data);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProjects();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen bg-transparent text-white pt-28 pb-20 relative" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#951C30]/6 blur-[140px]" />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-amber-500/4 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-10 group"
        >
          {isRtl ? (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          )}
          {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-amber-400/80 mb-4 font-semibold">
            <ShoppingBag className="w-4 h-4" />
            {t('kicker')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white leading-tight">
            {t('pageTitle')}
          </h1>
          <p className="mt-4 max-w-xl text-white/45 font-light leading-relaxed">
            {t('pageSubtitle')}
          </p>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[1.5rem] border border-white/5 bg-white/[0.02] animate-pulse"
                style={{ height: '420px' }}
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-white/30 text-lg font-light">{t('noProjects')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={String(project._id ?? project.slug ?? `sale-${i}`)}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <MarketplaceCard
                  project={project}
                  locale={locale}
                  t={t}
                  onBuy={() => setModalProject(project)}
                />
              </motion.div>
            ))}
          </div>
        )}
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
    </main>
  );
}

function MarketplaceCard({
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
    <div className="group relative rounded-[1.5rem] overflow-hidden border border-white/10 bg-[#0e0608] flex flex-col transition-all duration-500 hover:border-[#951C30]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '240px' }}>
        {media ? (
          <Image
            src={media}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#1a0a14] text-white/20 text-sm">
            No Image
          </div>
        )}
        {/* Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e0608]/80 via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-sm px-3 py-1 shadow-lg">
          <span className="text-sm font-bold text-amber-950">{formattedPrice}</span>
          <span className="text-xs font-semibold text-amber-800">{project.currency ?? 'SAR'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <h3 className="font-serif text-lg font-normal text-white leading-tight line-clamp-1">{title}</h3>
          {description && (
            <p className="mt-1.5 text-sm text-white/45 line-clamp-2 leading-relaxed">{description}</p>
          )}

          {/* Price placed cleanly under project description */}
          <div className="mt-3.5 pt-3 border-t border-white/5 flex items-baseline justify-between">
            <span className="text-xs text-white/40 uppercase tracking-wider font-medium">
              {locale === 'ar' ? 'السعر' : 'Price'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-amber-400 tracking-tight drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]">
                {formattedPrice}
              </span>
              <span className="text-xs font-semibold text-amber-300/80">
                {project.currency ?? 'SAR'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {/* Glowing chic Purchase Button */}
          <div className="relative flex-1 group/btn">
            {/* Glowing animated halo */}
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500/40 via-rose-500/50 to-amber-500/40 blur-[5px] opacity-75 group-hover/btn:opacity-100 animate-pulse transition duration-500" />
            
            <button
              onClick={onBuy}
              id={`marketplace-buy-${project.slug}`}
              className="relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#951C30] via-[#be2542] to-[#7a1628] px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(194,40,69,0.35)] transition-all duration-300 group-hover/btn:shadow-[0_0_25px_rgba(251,191,36,0.55)] group-hover/btn:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              {/* Shine streak across button */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              <span className="relative z-10 drop-shadow-sm">{t('buyNow')}</span>
            </button>
          </div>

          <Link
            href={`/work/${project.slug as string}`}
            className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors"
            aria-label={`View ${title}`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
