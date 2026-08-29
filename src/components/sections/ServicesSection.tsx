'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

export default function ServicesSection() {
  const [services, setServices] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const locale = useLocale();
  const t = useTranslations('Services');
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      })
      .catch((err) => console.error('Failed to fetch services:', err));
  }, []);

  // IntersectionObserver — no GSAP pinning, no Lenis conflicts
  // Each service item watches itself; whichever is most visible becomes active
  useEffect(() => {
    if (services.length === 0) return;

    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((el, index) => {
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            setExpandedIndex(index);
          }
        },
        { threshold: 0.45, rootMargin: '-10% 0px -10% 0px' }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [services]);

  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-16 md:py-24 lg:py-32 text-white relative">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-[1px] bg-rose-900/50" />
            <h2 className="text-sm tracking-[0.3em] uppercase text-rose-100/60 font-medium">
              {t('title') || 'Services'}
            </h2>
          </div>
          <p className="max-w-md text-rose-100/50 text-sm md:text-base leading-relaxed md:text-right rtl:md:text-left">
            {t('description') || 'Five disciplines, one continuous system — from the first mark to the shipped storefront.'}
          </p>
        </div>

        {/* Accordion driven by IntersectionObserver (scroll position) */}
        <div className="flex flex-col gap-3 md:gap-4">
          {services.map((service, index) => {
            const isExpanded = expandedIndex === index;

            const title =
              locale === 'ar'
                ? service.translations?.ar?.title || service.title
                : service.translations?.en?.title || service.title;
            const description =
              locale === 'ar'
                ? service.translations?.ar?.description || service.description
                : service.translations?.en?.description || service.description;
            const num = (index + 1).toString().padStart(2, '0');

            return (
              <div
                key={String(service._id ?? service.slug ?? service.title ?? `svc-${index}`)}
                ref={(el) => { itemRefs.current[index] = el; }}
                className="group relative cursor-pointer"
                onClick={() => setExpandedIndex(index)}
              >
                <div
                  className={`relative rounded-2xl border transition-all duration-500 ease-out
                    ${isExpanded
                      ? 'border-rose-500/40 bg-rose-950/[0.15] shadow-[0_12px_48px_-16px_rgba(225,29,72,0.45)]'
                      : 'border-rose-900/20 bg-white/[0.01] hover:border-rose-500/25'}`}
                >
                  {/* Header Row */}
                  <div className="w-full px-5 sm:px-6 md:px-10 py-6 md:py-9 flex items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-5 md:gap-10 min-w-0">
                      <span className="shrink-0 text-xs md:text-sm font-mono text-rose-500/50 tracking-[0.2em]">
                        {num}
                      </span>
                      <h3
                        className={`font-bold uppercase tracking-tight leading-none transition-colors duration-400 text-xl sm:text-2xl md:text-4xl lg:text-5xl break-words ${
                          isExpanded ? 'text-white' : 'text-rose-100/30 group-hover:text-rose-100/55'
                        }`}
                      >
                        {title}
                      </h3>
                    </div>

                    {/* Active dot indicator */}
                    <span
                      className={`flex-shrink-0 grid place-items-center w-10 h-10 md:w-11 md:h-11 rounded-full border transition-all duration-400 ${
                        isExpanded ? 'border-rose-500/50 bg-rose-500/10' : 'border-rose-900/30'
                      }`}
                    >
                      <span
                        className={`block rounded-full transition-all duration-400 ${
                          isExpanded ? 'w-2.5 h-2.5 bg-rose-400' : 'w-2 h-2 bg-rose-900/40'
                        }`}
                      />
                    </span>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 md:px-10 pb-9 md:pb-11 flex flex-col md:flex-row gap-8 md:gap-16">
                          <div className="flex-1 space-y-5">
                            <div className="h-px w-full bg-gradient-to-r from-rose-500/40 to-transparent" />
                            <p className="text-base md:text-lg text-rose-100/70 leading-relaxed font-light">
                              {description}
                            </p>

                            {service.tags && service.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2.5">
                                {service.tags.map((tag: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-3.5 py-1.5 rounded-full border border-rose-900/40 text-[11px] font-medium tracking-wider uppercase text-rose-300/80 bg-rose-950/20"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {service.image && (
                            <div className="flex-1 w-full max-w-lg aspect-[4/3] relative overflow-hidden rounded-xl">
                              <img
                                src={service.image}
                                alt={title}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0507]/80 to-transparent" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
