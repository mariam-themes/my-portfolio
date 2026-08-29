import { useLayoutEffect, useMemo, useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Project } from '@/types/case-study';

export function Hero({ project, reducedMotion }: { project: Project; reducedMotion: boolean }) {
  const t = useTranslations('CaseStudy');
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

  return (
    <section ref={heroRef} className="relative flex min-h-[70svh] sm:min-h-[100svh] flex-col justify-end px-5 pb-16 pt-16 sm:px-12 sm:pb-20 sm:pt-24 lg:px-16 overflow-hidden">

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

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute top-[10%] left-[5%] w-[35rem] h-[35rem] rounded-full bg-[#951C30]/10 blur-[180px]" />
        <div className="absolute bottom-[15%] right-[10%] w-[28rem] h-[28rem] rounded-full bg-[#951C30]/8 blur-[150px]" />
        <div className="absolute top-[40%] left-[50%] w-[20rem] h-[20rem] rounded-full bg-[#951C30]/5 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl">
        {/* Text readability overlay */}
        <div className="absolute -inset-x-4 -inset-y-6 sm:-inset-x-8 sm:-inset-y-10 rounded-2xl bg-gradient-to-t from-[#0b0107]/80 via-[#0b0107]/40 to-transparent -z-10" />
        {/* Badges */}
        <div data-hero-badge className="mb-6 flex flex-wrap items-center gap-3">
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
          className="text-5xl sm:text-7xl md:text-[7.5rem] lg:text-[8.5rem] font-serif tracking-[-0.03em] will-change-[opacity,transform] leading-[0.88] mb-8"
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

        {/* CTA */}
        <div data-hero-cta className="flex flex-wrap items-center gap-4">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#951C30] px-8 py-4 text-xs font-bold uppercase tracking-[.2em] text-white shadow-xl shadow-rose-900/30 transition-all hover:bg-[#b8223b] hover:shadow-rose-800/40 hover:scale-[1.02]">
              {t('exploreProject')} <ArrowRight className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-xs font-bold uppercase tracking-[.2em] text-white/60 backdrop-blur-sm transition-all hover:border-white/30 hover:text-white/90 scroll-btn-bounce"
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
