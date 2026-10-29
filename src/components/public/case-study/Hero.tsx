'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, ShoppingBag } from 'lucide-react';
import { gsap } from 'gsap';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Project } from '@/types/case-study';
import PurchaseModal from '@/components/sections/PurchaseModal';

export function Hero({ project, reducedMotion }: { project: Project; reducedMotion: boolean }) {
  const t = useTranslations('CaseStudy');
  const tSale = useTranslations('VisualIdentitiesForSale');
  const locale = useLocale();

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = heroRef.current;
    if (!root || reducedMotion) return;

    const context = gsap.context(() => {
      const q = gsap.utils.selector(root);

      gsap.set(q('[data-hero-badge]'), { opacity: 0, y: 20 });
      gsap.set(q('[data-hero-title]'), { opacity: 0, y: 60, scale: 0.96 });
      gsap.set(q('[data-hero-meta]'), { opacity: 0, y: 20 });
      gsap.set(q('[data-hero-desc]'), { opacity: 0, y: 20 });
      gsap.set(q('[data-hero-cta]'), { autoAlpha: 0, y: 20 });
      gsap.set(q('[data-hero-image]'), { opacity: 0, scale: 1.08 });

      const tl = gsap.timeline({ delay: 0.15 });

      tl.to(q('[data-hero-image]'), { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
        .to(q('[data-hero-badge]'), { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.2)
        .to(q('[data-hero-title]'), { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power4.out' }, 0.3)
        .to(q('[data-hero-meta]'), { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.6)
        .to(q('[data-hero-desc]'), { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.7)
        .to(q('[data-hero-cta]'), { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.9);
    }, root);

    return () => context.revert();
  }, [reducedMotion, project.title]);

  const heroImage = project.heroMediaUrl || project.gallery?.[0]?.url;

  const formattedPrice = project.price
    ? new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(project.price)
    : '';

  return (
    <section ref={heroRef} className="relative flex min-h-[70svh] sm:min-h-[100svh] flex-col justify-end px-5 pb-16 pt-32 sm:px-12 sm:pb-20 sm:pt-40 lg:px-16 overflow-hidden">

      {/* Background image */}
      {heroImage && (
        <div data-hero-image className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="h-full w-full object-cover object-center"
          />
          {/* Multi-layer gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0107] via-[#0b0107]/70 to-[#0b0107]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0107]/80 to-transparent" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_20%_80%,rgba(149,28,48,0.18),transparent_60%)]" />
        </div>
      )}

      {/* Ambient glow blobs - using radial gradients instead of heavy blur filters for performance */}
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-60">
        <div className="absolute top-[10%] left-[5%] w-[45rem] h-[45rem] rounded-full [background:radial-gradient(circle,rgba(149,28,48,0.18)_0%,transparent_65%)]" />
        <div className="absolute bottom-[15%] right-[10%] w-[38rem] h-[38rem] rounded-full [background:radial-gradient(circle,rgba(149,28,48,0.14)_0%,transparent_65%)]" />
        <div className="absolute top-[40%] left-[50%] w-[28rem] h-[28rem] rounded-full [background:radial-gradient(circle,rgba(149,28,48,0.08)_0%,transparent_65%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl">
        {/* Text readability overlay */}
        <div className="absolute -inset-x-4 -inset-y-6 sm:-inset-x-8 sm:-inset-y-10 rounded-2xl bg-gradient-to-t from-[#0b0107]/80 via-[#0b0107]/40 to-transparent -z-10" />
        
        {/* Badges */}
        <div data-hero-badge className="mb-6 flex flex-wrap items-center gap-3">
          {project.isForSale && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-[11px] font-bold tracking-widest text-amber-300 uppercase backdrop-blur-sm shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              {locale === 'ar' ? 'هوية بصرية معروضة للبيع' : 'Identity for Sale'}
            </span>
          )}
          {(project.sector || project.category) && (
            <span className="inline-block rounded-full border border-[#951C30]/40 bg-[#951C30]/10 px-5 py-2 text-[11px] font-bold tracking-widest text-[#951C30] uppercase backdrop-blur-sm"
              style={{ textShadow: '0 0 20px rgba(149,28,48,0.5)' }}>
              {project.sector || project.category}
            </span>
          )}
          {project.platform && (
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-bold tracking-widest text-white/60 uppercase backdrop-blur-sm">
              {project.platform}
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          data-hero-title
          className="text-4xl sm:text-5xl md:text-[4rem] lg:text-[5rem] xl:text-[5.5rem] font-serif tracking-[-0.03em] will-change-[opacity,transform] leading-[0.9] mb-8"
          style={{
            color: '#951C30',
            filter: 'drop-shadow(0 0 40px rgba(149,28,48,0.25))',
          }}
        >
          {project.title}
        </h1>

        {/* Meta row */}
        <div data-hero-meta className="mb-8 flex flex-wrap items-center gap-6 text-xs font-mono tracking-widest text-white/40">
          {project.year && <span>{project.year}</span>}
          {project.sector && <span>• {project.sector}</span>}
          {project.platform && <span>• {project.platform}</span>}
        </div>

        {/* Description */}
        <p
          data-hero-desc
          className="max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed tracking-wide text-white/55 mb-10 opacity-0 translate-y-5"
          dir="auto"
        >
          {project.description || 'A focused visual system designed to make every interaction feel intentional.'}
        </p>

        {/* CTA Buttons Row */}
        <div data-hero-cta className="flex flex-wrap items-center gap-4">
          {/* Chic Purchase Button (Only for visual identities for sale) */}
          {project.isForSale && (
            <div className="relative group/buy">
              {/* Glowing animated halo */}
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500/50 via-rose-500/60 to-amber-500/50 blur-[6px] opacity-80 group-hover/buy:opacity-100 transition duration-300 animate-pulse" />
              
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                id="case-study-hero-buy-now"
                className="relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#951C30] via-[#be2542] to-[#7a1628] px-7 py-4 text-xs sm:text-sm font-bold uppercase tracking-[.15em] rtl:tracking-normal text-white shadow-[0_4px_30px_rgba(149,28,48,0.5)] transition-all duration-300 group-hover/buy:scale-[1.03] group-hover/buy:shadow-[0_0_35px_rgba(251,191,36,0.6)] active:scale-[0.98] overflow-hidden"
              >
                {/* Shine sweep */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover/buy:translate-x-full" />
                <ShoppingBag className="h-4 w-4 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                <span className="relative z-10">{tSale('buyNow') || (locale === 'ar' ? 'طلب الشراء' : 'Request to Purchase')}</span>
                {project.price ? (
                  <span className="relative z-10 ms-1 inline-flex items-center gap-1 rounded-full bg-black/40 border border-amber-500/30 px-3 py-1 font-mono text-xs font-bold text-amber-300 shadow-inner">
                    {formattedPrice} {project.currency || 'SAR'}
                  </span>
                ) : null}
              </button>
            </div>
          )}

          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#951C30] px-8 py-4 text-xs font-bold uppercase tracking-[.2em] rtl:tracking-normal text-white shadow-xl shadow-rose-900/30 transition-all hover:bg-[#b8223b] hover:shadow-rose-800/40 hover:scale-[1.02]">
              {t('exploreProject')} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </a>
          )}

          {/* Scroll Down Button */}
          <button
            onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-xs font-bold uppercase tracking-[.2em] rtl:tracking-normal text-white/70 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover:text-white scroll-btn-bounce"
          >
            {t('scroll')} <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        <div className="relative h-14 w-[1px] overflow-hidden">
          <div className="absolute inset-0 bg-white/10" />
          <div className="scroll-indicator-fill absolute top-0 left-0 w-full bg-gradient-to-b from-[#951C30] via-[#951C30]/60 to-transparent" />
        </div>
      </div>

      {/* Purchase Modal for visual identities for sale */}
      {project.isForSale && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          projectTitle={project.title}
          projectSlug={project.slug}
          price={project.price || 0}
          currency={project.currency || 'SAR'}
        />
      )}

      <style>{`
        @keyframes scroll-bar-move {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
        .scroll-indicator-fill {
          animation: scroll-bar-move 2s ease-in-out infinite;
        }
        @keyframes scroll-btn-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .scroll-btn-bounce {
          animation: scroll-btn-bounce 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
