'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { type LocalizedProject } from '@/lib/localizeProject';
import FeaturedProjectCard from '@/components/sections/FeaturedProjectCard';
import { motion, useReducedMotion } from 'framer-motion';

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function FeaturedProjectsGrid() {
  const t = useTranslations('FeaturedProjects');
  const shouldReduceMotion = useReducedMotion();
  const [projects, setProjects] = useState<LocalizedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/projects?featured=true&sort=asc');
        const json = await res.json();
        if (json.success) setProjects(json.data as LocalizedProject[]);
      } catch (err) {
        console.error('Failed to fetch featured projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-transparent relative z-10 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
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
          <p className="mt-5 max-w-xl mx-auto text-white/50 font-light leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-5 md:gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`flex flex-1 flex-col rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse min-w-0 max-w-[320px] lg:max-w-[340px] xl:max-w-[360px] mx-auto w-full md:mx-0 ${i === 1 ? 'md:scale-[1.04]' : ''}`}
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
        ) : projects.length === 0 ? (
          <p className="text-center text-white/50 font-light">{t('noProjects')}</p>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {chunk(projects, 3).map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="relative flex flex-col md:flex-row items-stretch justify-center gap-5 md:gap-4 lg:gap-5"
                dir="ltr"
              >
                <div className="pointer-events-none absolute inset-x-0 -bottom-4 hidden h-8 rounded-[2rem] bg-white/[0.02] blur-2xl md:block" />
                {row.map((project, i) => {
                  const isMiddle = row.length === 3 && i === 1;
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
                      key={String(project._id ?? project.slug ?? 'feat-' + rowIndex + '-' + i)}
                      initial={initial}
                      whileInView={animate}
                      viewport={{ once: true, amount: 0.25, margin: '-80px' }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0.4 }
                          : {
                              duration: 0.85,
                              ease: [0.16, 1, 0.3, 1],
                              delay: isMiddle ? 0.18 : i === 0 ? 0 : 0.12,
                            }
                      }
                      className={`flex flex-1 max-w-[320px] lg:max-w-[340px] xl:max-w-[360px] mx-auto w-full md:mx-0 min-w-0 will-change-transform ${isMiddle ? 'md:z-10' : 'md:z-0'}`}
                    >
                      <div className={`h-full ${isMiddle ? 'md:shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:ring-1 md:ring-[#951C30]/20' : ''}`}>
                        <FeaturedProjectCard
                          project={project}
                          index={rowIndex * 3 + i}
                          variant={isMiddle ? 'overlay' : 'default'}
                        />
                      </div>
                    </motion.div>
                  );
                })}
                {/* fill missing slots to keep deck centered when row has <3 */}
                {row.length < 3 &&
                  Array.from({ length: 3 - row.length }).map((_, k) => (
                    <div key={`empty-${k}`} className="hidden md:block flex-1 max-w-[420px]" />
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
