'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { type LocalizedProject } from '@/lib/localizeProject';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import FeaturedProjectCard from './FeaturedProjectCard';

const MAX_FEATURED = 3;

export default function FeaturedProjectsSection() {
  const t = useTranslations('FeaturedProjects');
  const shouldReduceMotion = useReducedMotion();
  const [projects, setProjects] = useState<LocalizedProject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/projects?featured=true&sort=asc');
        const json = await res.json();
        if (json.success) {
          const all = json.data as LocalizedProject[];
          setTotal(all.length);
          setProjects(all.slice(0, MAX_FEATURED));
        }
      } catch (err) {
        console.error('Failed to fetch featured projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  if (!loading && projects.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-transparent relative z-10 overflow-hidden">
      <div className="container mx-auto px-8 md:px-16 lg:px-24 xl:px-32">
        {/* Header */}
        <div className="mx-auto max-w-4xl mb-16 md:mb-20 text-center">
          <div className="flex items-center justify-center gap-4 text-xs tracking-[0.2em] uppercase text-accent mb-4">
            <span className="w-12 h-[1px] bg-accent/50" />
            {t('kicker')}
            <span className="w-12 h-[1px] bg-accent/50" />
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-normal text-foreground leading-tight">
            {t('title')}{' '}
            <span className="italic" style={{ color: '#951C30' }}>
              {t('titleAccent')}
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/50 font-light leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Deck — 3 cards side by side, middle bigger */}
        {loading ? (
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-5 md:gap-4">
            {Array.from({ length: MAX_FEATURED }).map((_, i) => (
              <div
                key={i}
                className={`flex flex-1 flex-col rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse min-w-0 max-w-[360px] mx-auto w-full md:mx-0 ${
                  i === 1 ? 'md:scale-[1.04]' : ''
                }`}
              >
                <div className="aspect-[16/11] rounded-t-[2rem] bg-white/5" />
                <div className="flex-1 p-7 space-y-3">
                  <div className="h-3 w-20 rounded bg-white/10" />
                  <div className="h-6 w-2/3 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-5 md:gap-4 lg:gap-5" dir="ltr">
            {/* subtle base / pedestal */}
            <div className="pointer-events-none absolute inset-x-0 -bottom-4 hidden h-8 rounded-[2rem] bg-white/[0.02] blur-2xl md:block" />

            {projects.map((project, i) => {
              const isMiddle = i === 1;
              const initial: Record<string, number> = shouldReduceMotion
                ? { opacity: 0 }
                : isMiddle
                  ? { y: 80, scale: 0.88, opacity: 0 }
                  : i === 0
                    ? { x: -140, opacity: 0 }
                    : { x: 140, opacity: 0 };

              const animate: Record<string, number> = shouldReduceMotion
                ? { opacity: 1 }
                : { x: 0, y: 0, scale: isMiddle ? 1.04 : 1, opacity: 1 };

              return (
                <motion.div
                  key={project._id as string}
                  initial={initial}
                  whileInView={animate}
                  viewport={{ once: false, amount: 0.25, margin: '-80px' }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.4 }
                      : {
                          duration: 0.85,
                          ease: [0.16, 1, 0.3, 1],
                          delay: isMiddle ? 0.18 : i === 0 ? 0 : 0.12,
                        }
                  }
                  className={`flex flex-1 max-w-[320px] lg:max-w-[340px] xl:max-w-[360px] mx-auto w-full md:mx-0 min-w-0 will-change-transform ${
                    isMiddle ? 'md:z-10' : 'md:z-0'
                  }`}
                >
                  <div
                    className={`h-full ${
                      isMiddle
                        ? 'md:shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:ring-1 md:ring-[#951C30]/20'
                        : ''
                    }`}
                  >
                    <FeaturedProjectCard project={project} index={i} variant={isMiddle ? 'overlay' : 'default'} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {total > MAX_FEATURED && (
          <div className="mt-14 flex justify-center">
            <Link
              href={{ pathname: '/work', query: { featured: 'true' } }}
              className="group inline-flex items-center gap-3 rounded-full bg-[#951C30] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-rose-900/30 transition-all duration-300 hover:bg-[#b8223b] hover:shadow-rose-800/40 hover:-translate-y-0.5"
            >
              {t('viewAll')}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
