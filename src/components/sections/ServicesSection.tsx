'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight } from 'lucide-react';
import { formatPortfolioNumber } from '@/lib/formatters';

const EXPAND_LOCK_MS = 520;
const DESKTOP_MQ = '(min-width: 768px)';

export default function ServicesSection() {
  const [services, setServices] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const locale = useLocale();
  const t = useTranslations('Services');
  const headerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const expandedIndexRef = useRef(expandedIndex);
  const lockUntilRef = useRef(0);

  expandedIndexRef.current = expandedIndex;

  const selectIndex = (index: number) => {
    lockUntilRef.current = performance.now() + EXPAND_LOCK_MS;
    setExpandedIndex(index);
  };

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      })
      .catch((err) => console.error('Failed to fetch services:', err));
  }, []);

  // Limit to 4 services for homepage as requested
  const displayedServices = services.slice(0, 4);

  // Desktop only: observe stable header rows (not expanding cards) and pick
  // the most visible item with hysteresis so accordion height changes cannot
  // flip the active index in a loop. Touch/mobile stays click-driven.
  useEffect(() => {
    if (displayedServices.length === 0) return;

    const ratios = new Array(displayedServices.length).fill(0);
    let observers: IntersectionObserver[] = [];
    let frame = 0;

    const disconnect = () => {
      observers.forEach((o) => o.disconnect());
      observers = [];
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const bind = () => {
      disconnect();
      if (!window.matchMedia(DESKTOP_MQ).matches) return;

      const applyBest = () => {
        frame = 0;
        if (performance.now() < lockUntilRef.current) return;

        const current = expandedIndexRef.current;
        let best = current;
        let bestRatio = ratios[current] ?? 0;

        ratios.forEach((ratio, index) => {
          if (ratio > bestRatio + 0.12) {
            best = index;
            bestRatio = ratio;
          }
        });

        if (bestRatio >= 0.35 && best !== current) {
          lockUntilRef.current = performance.now() + EXPAND_LOCK_MS;
          setExpandedIndex(best);
        }
      };

      headerRefs.current.forEach((el, index) => {
        if (!el) return;
        const obs = new IntersectionObserver(
          ([entry]) => {
            ratios[index] = entry.isIntersecting ? entry.intersectionRatio : 0;
            if (!frame) frame = requestAnimationFrame(applyBest);
          },
          {
            threshold: [0, 0.2, 0.35, 0.5, 0.75, 1],
            rootMargin: '-20% 0px -40% 0px',
          }
        );
        obs.observe(el);
        observers.push(obs);
      });
    };

    bind();
    const mq = window.matchMedia(DESKTOP_MQ);
    mq.addEventListener('change', bind);

    return () => {
      mq.removeEventListener('change', bind);
      disconnect();
    };
  }, [displayedServices.length]);

  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-16 md:py-24 lg:py-32 text-white relative">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">

        {/* Header */}
        <div className="flex flex-col items-start mb-10 md:mb-16 gap-4">
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-[#951C30] font-semibold mb-2 rtl:tracking-normal w-fit">
            <span className="w-12 h-[1px] bg-[#951C30]/50" />
            {t('title') || 'Services'}
            <span className="w-12 h-[1px] bg-[#951C30]/50" />
          </div>
          <p className="max-w-xl text-rose-100/50 text-sm md:text-base leading-relaxed">
            {t('description') || 'Five disciplines, one continuous system — from the first mark to the shipped storefront.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:gap-4">
          {displayedServices.map((service, index) => {
            const isExpanded = expandedIndex === index;

            const title =
              locale === 'ar'
                ? service.translations?.ar?.title || service.title
                : service.translations?.en?.title || service.title;
            const description =
              locale === 'ar'
                ? service.translations?.ar?.description || service.description
                : service.translations?.en?.description || service.description;
            const num = formatPortfolioNumber(index + 1, locale);

            return (
              <div
                key={String(service._id ?? service.slug ?? service.title ?? `svc-${index}`)}
                className="group relative cursor-pointer"
                onClick={() => selectIndex(index)}
              >
                <div
                  className={`relative rounded-2xl border transition-[border-color,background-color,box-shadow] duration-500 ease-out
                    ${isExpanded
                      ? 'border-rose-500/40 bg-rose-950/[0.15] shadow-[0_12px_48px_-16px_rgba(225,29,72,0.45)]'
                      : 'border-rose-900/20 bg-white/[0.01] hover:border-rose-500/25'}`}
                >
                  {/* Header Row — observed target (stable height) */}
                  <div
                    ref={(el) => { headerRefs.current[index] = el; }}
                    className="w-full px-5 sm:px-6 md:px-10 py-6 md:py-9 flex items-center justify-between gap-4 sm:gap-6"
                  >
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

                    <span
                      className={`flex-shrink-0 grid place-items-center w-10 h-10 md:w-11 md:h-11 rounded-full border transition-[border-color,background-color] duration-400 ${
                        isExpanded ? 'border-rose-500/50 bg-rose-500/10' : 'border-rose-900/30'
                      }`}
                    >
                      <span
                        className={`block rounded-full transition-[width,height,background-color] duration-400 ${
                          isExpanded ? 'w-2.5 h-2.5 bg-rose-400' : 'w-2 h-2 bg-rose-900/40'
                        }`}
                      />
                    </span>
                  </div>

                  {/* Grid 0fr→1fr avoids Framer Motion height:auto layout thrash */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                    aria-hidden={!isExpanded}
                  >
                    <div className="overflow-hidden min-h-0">
                      <div className="px-6 md:px-10 pb-9 md:pb-11 flex flex-col md:flex-row gap-8 md:gap-16 items-center">
                        <div className="flex-1 space-y-5 w-full">
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
                          <div className="w-full max-w-[300px] sm:max-w-[340px] md:max-w-[380px] aspect-square relative rounded-2xl overflow-hidden border border-white/10 group-hover:border-[#951C30]/40 shrink-0 shadow-xl shadow-black/50">
                            {isExpanded && (
                              <img
                                src={service.image}
                                alt={title}
                                decoding="async"
                                className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-[1.03]"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {services.length > 0 && (
          <div className="relative z-10 flex justify-center pt-10 md:pt-16">
            <Link
              href="/services"
              className="group inline-flex items-center gap-3 rounded-full bg-[#951C30] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] rtl:tracking-normal text-white shadow-lg shadow-rose-900/30 transition-all duration-300 hover:bg-[#b8223b] hover:shadow-rose-800/40 hover:-translate-y-0.5"
            >
              {t('viewAll') || (locale === 'ar' ? 'عرض جميع الخدمات' : 'View All Services')}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
