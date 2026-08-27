'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

export default function ServicesSection() {
  const [services, setServices] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First item expanded by default
  const locale = useLocale();
  const t = useTranslations('Services');
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      })
      .catch((err) => console.error('Failed to fetch services:', err));
  }, []);

  useGSAP(
    () => {
      if (!services || services.length === 0) return;

      let mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Parallax for the header
        gsap.fromTo(headerRef.current, 
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              end: 'top 30%',
              scrub: 1,
            }
          }
        );

        // Staggered reveal for service items based on scroll
        const items = gsap.utils.toArray('.service-item');
        items.forEach((item: any, i) => {
          gsap.fromTo(item,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              scrollTrigger: {
                trigger: item,
                start: 'top 95%',
                end: 'top 65%',
                scrub: 1,
              }
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [services] }
  );

  if (!services || services.length === 0) return null;

  return (
    <section ref={sectionRef} id="services" className="py-24 md:py-32 text-white relative">
      <div className="container mx-auto px-8 md:px-16 lg:px-24 xl:px-32 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-[1px] bg-rose-900/50" />
            <h2 className="text-sm tracking-[0.3em] uppercase text-rose-100/60 font-medium">
            {t('title') || 'Services'}
            </h2>
          </div>
          <p className="max-w-md text-rose-100/50 text-sm md:text-base leading-relaxed md:text-right">
            {t('description') || 'Five disciplines, one continuous system — from the first mark to the shipped storefront.'}
          </p>
        </div>

        {/* Interactive service stack */}
        <div className="flex flex-col gap-4 md:gap-5">
          {services.map((service, index) => {
            const isExpanded = expandedIndex === index;

            // Handle translations
            const title = locale === 'ar' ? (service.translations?.ar?.title || service.title) : (service.translations?.en?.title || service.title);
            const description = locale === 'ar' ? (service.translations?.ar?.description || service.description) : (service.translations?.en?.description || service.description);
            const num = (index + 1).toString().padStart(2, '0');

            return (
              <div key={service._id} className="service-item group relative">
                <div
                  className={`relative rounded-2xl border transition-all duration-500 ease-out will-change-transform
                    ${isExpanded
                      ? 'border-rose-500/40 bg-rose-950/[0.15] shadow-[0_12px_48px_-16px_rgba(225,29,72,0.5)]'
                      : 'border-rose-900/25 bg-white/[0.015] hover:-translate-y-1 hover:border-rose-500/40 hover:bg-white/[0.04] hover:shadow-[0_12px_48px_-20px_rgba(225,29,72,0.35)]'}`}
                >
                  {/* Header Row */}
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    aria-expanded={isExpanded}
                    className="w-full px-6 md:px-10 py-7 md:py-9 flex items-center justify-between gap-6 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 rounded-2xl"
                  >
                    <div className="flex items-center gap-5 md:gap-10 min-w-0">
                      <span className="text-xs md:text-sm font-mono text-rose-500/60 tracking-[0.2em]">
                        {num}
                      </span>
                      <h3 className={`font-bold uppercase tracking-tight leading-none transition-colors duration-500 truncate text-2xl md:text-4xl lg:text-5xl ${isExpanded ? 'text-white' : 'text-rose-100/40 group-hover:text-rose-100/80'}`}>
                        {title}
                      </h3>
                    </div>
                    <span
                      className={`flex-shrink-0 grid place-items-center w-10 h-10 md:w-12 md:h-12 rounded-full border transition-all duration-500
                        ${isExpanded
                          ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                          : 'border-rose-900/40 text-rose-500/60 group-hover:border-rose-500/50 group-hover:text-rose-400'}`}
                    >
                      {isExpanded ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </span>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 md:px-10 pb-9 md:pb-11 flex flex-col md:flex-row gap-8 md:gap-16">
                          {/* Text & Tags */}
                          <div className="flex-1 space-y-6">
                            <div className="h-px w-full bg-gradient-to-r from-rose-500/40 to-transparent" />
                            <p className="text-base md:text-lg text-rose-100/75 leading-relaxed font-light">
                              {description}
                            </p>

                            {service.tags && service.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2.5">
                                {service.tags.map((tag: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-3.5 py-1.5 rounded-full border border-rose-900/40 text-[11px] font-medium tracking-wider uppercase text-rose-300/90 bg-rose-950/20"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Image */}
                          {service.image && (
                            <div className="flex-1 w-full max-w-lg aspect-[4/3] relative overflow-hidden rounded-xl">
                              <img
                                src={service.image}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
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
