import { useLayoutEffect, useMemo, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { gsap } from 'gsap';
import { Project } from '@/types/case-study';

export function Hero({ project, reducedMotion }: { project: Project; reducedMotion: boolean }) {
  const heroRef = useRef<HTMLElement>(null);

  const ambientDots = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: ((i * 37) % 101) - 1,
    top: ((i * 61) % 101) - 1,
    size: 3 + ((i * 13) % 6), // slightly larger
    dur: 4 + ((i * 7) % 8),
  })), []);

  useLayoutEffect(() => {
    const root = heroRef.current;
    if (!root || reducedMotion) return;
    const context = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const amb = q('[data-ambient-particle]');
      gsap.set(amb, { opacity: 0 }); // Start hidden (use opacity, not autoAlpha so visibility doesn't break)
      
      amb.forEach((el, i) => {
        gsap.to(el, {
          x: () => gsap.utils.random(-80, 80),
          y: () => gsap.utils.random(-80, 80),
          opacity: () => gsap.utils.random(0.4, 0.8), // Brighter
          duration: ambientDots[i % ambientDots.length].dur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: gsap.utils.random(0, 2)
        });
      });
    }, root);
    return () => context.revert();
  }, [reducedMotion, ambientDots]);

  useLayoutEffect(() => {
    const root = heroRef.current;
    if (!root || reducedMotion) return;

    const context = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const title = q('[data-hero-title]');
      const desc = q('[data-hero-desc]');

      gsap.set(title, { opacity: 0, y: 50, scale: 0.95 });
      gsap.set(desc, { opacity: 0, y: 20 });
      gsap.set('[data-hero-cta]', { autoAlpha: 0, y: 20 });

      const tl = gsap.timeline({ delay: 0.1 });
      
      tl.to(title, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power4.out' })
        .to(desc, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=0.9')
        .to('[data-hero-cta]', { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.6');
    }, root);
    return () => context.revert();
  }, [reducedMotion, project.title]);

  return (
    <section ref={heroRef} className="relative flex min-h-[100svh] flex-col items-start justify-center px-6 py-28 text-left sm:px-12 lg:px-16 perspective-[1000px]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {ambientDots.map((dot) => (
          <i key={dot.id} data-ambient-particle className="absolute rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.6)]" style={{ left: `${dot.left}%`, top: `${dot.top}%`, width: dot.size, height: dot.size }} aria-hidden="true" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_18%_26%,rgba(183,35,77,.22),transparent_50%)]" />

      <div className="relative mb-8 flex flex-wrap items-center gap-3">
        {(project.sector || project.category) && (
          <span className="inline-block rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[.35em] text-[var(--accent)]">
            {project.sector || project.category}
          </span>
        )}
        {project.year && (
          <span className="inline-block rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[.35em] text-[var(--accent)]">
            {project.year}
          </span>
        )}
      </div>

      <div className="relative w-full">
        <h1
          data-hero-title
          className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-[#fdf2f4] will-change-[opacity,transform]"
          style={{ textShadow: '0 4px 40px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.8)' }}
        >
          {project.title}
        </h1>
      </div>

      <div className="relative mt-8 max-w-3xl text-[clamp(1.05rem,2.3vw,1.9rem)] font-medium leading-snug tracking-[-.01em] text-[#f4d7dd]" dir="auto">
        <p data-hero-desc className="opacity-0 translate-y-6 will-change-[opacity,transform]">{project.description || 'A focused visual system designed to make every interaction feel intentional.'}</p>
      </div>

      {project.liveUrl && (
        <div data-hero-cta className="relative mt-11">
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#951C30] px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#fdf2f4] shadow-xl shadow-rose-900/40 transition hover:bg-[#b8223b] hover:scale-[1.04]">
            Explore Project <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
    </section>
  );
}
