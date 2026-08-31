'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import BrowserMockup from './BrowserMockup';
import { Project, NextProject } from '@/types/case-study';
import { CSSKeyframes, ImageBackground, SectionHeading } from './case-study/Shared';
import { Hero } from './case-study/Hero';
import {
  GallerySection,
  VisualSection,
  TransformSection,
  DeliverablesSection,
  ToolsSection,
  MetaSection
} from './case-study/ProjectSections';
import { ClosingSection, NextProjectTeaser } from './case-study/Closing';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_SECTION_ORDER = ['gallery', 'transform', 'visual', 'deliverables', 'tools', 'mockup', 'closing'] as const;
const SECTION_LABEL_KEY: Record<string, string> = {
  gallery: 'frames',
  transform: 'transformation',
  visual: 'visualDirection',
  deliverables: 'deliverables',
  tools: 'tools',
  mockup: 'fullExperience',
  closing: 'final',
};

export default function CaseStudyPresentation({ project, nextProject }: { project: Project; nextProject?: NextProject }) {
  const t = useTranslations('CaseStudy');
  const router = useRouter();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cameFromWork, setCameFromWork] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  const gallery = project.gallery?.length ? project.gallery : project.heroMediaUrl ? [{ url: project.heroMediaUrl, type: 'desktop' }] : [];
  const comparison = project.beforeAfter?.[0];
  const services = project.services?.length ? project.services : [t('fallbackArtDirection'), t('fallbackVisualIdentity'), t('fallbackDigitalExperience')];
  const tools = project.tools?.length ? project.tools : [project.platform || t('fallbackDigital'), t('fallbackStrategy'), t('fallbackDesign')];
  const finalMedia = project.closingImageUrl;
  const closingImages = project.closingImages?.length ? project.closingImages : null;

  const vdColors = useMemo(() => project.visualDirection?.colors?.filter(Boolean) || [], [project.visualDirection]);
  const vdFonts = useMemo(() => project.visualDirection?.fonts?.filter(Boolean) || [], [project.visualDirection]);
  const vdIdentity = useMemo(() => project.visualDirection?.identity?.filter(Boolean) || [], [project.visualDirection]);
  const vdImageStyle = useMemo(() => project.visualDirection?.imageStyle?.filter(Boolean) || [], [project.visualDirection]);
  const hasVisual = Boolean(vdColors.length || vdFonts.length || vdIdentity.length || vdImageStyle.length);

  const vdBlocks = useMemo(() => {
    const blocks: { id: string; label: string; items: string[] }[] = [];
    if (vdColors.length) blocks.push({ id: 'colors', label: t('vdColors'), items: vdColors });
    if (vdFonts.length) blocks.push({ id: 'fonts', label: t('vdFonts'), items: vdFonts });
    if (vdIdentity.length) blocks.push({ id: 'identity', label: t('vdIdentity'), items: vdIdentity });
    if (vdImageStyle.length) blocks.push({ id: 'imageStyle', label: t('vdImageStyle'), items: vdImageStyle });
    return blocks;
  }, [vdColors, vdFonts, vdIdentity, vdImageStyle, t]);

  const orderedSections = useMemo(() => {
    const raw: string[] = project.sectionOrder?.length ? project.sectionOrder : (DEFAULT_SECTION_ORDER as unknown as string[]);
    let list = raw.filter((s) => (DEFAULT_SECTION_ORDER as unknown as string[]).includes(s));
    list = list.filter((s) => s !== 'visual' || hasVisual);
    list = list.filter((s) => s !== 'mockup' || Boolean(project.fullPageMockupUrl));
    list = list.filter((s) => s !== 'closing' || Boolean(project.closingImages?.length || project.closingImageUrl));
    list = list.filter((s) => s !== 'transform' || Boolean(project.beforeAfter?.[0])); // skip if no comparison
    return [...new Set(list)];
  }, [project.sectionOrder, hasVisual, project.fullPageMockupUrl, project.closingImages, project.closingImageUrl, project.beforeAfter]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Detect if user came from /work page
  useEffect(() => {
    try {
      const ref = sessionStorage.getItem('caseStudyRef');
      if (ref === '/work') {
        setCameFromWork(true);
      }
      sessionStorage.removeItem('caseStudyRef');
    } catch {}
  }, []);

  // Track active section for left sidebar indicators
  useEffect(() => {
    const sections = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sections.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveSection(idx);
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [orderedSections]);

  // Track scroll progress for the traveling cursor — use ref to avoid re-renders
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
        const el = progressRef.current;
        if (el) {
          el.style.height = `${progress * 100}%`;
          el.style.top = `${progress * 100}%`;
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Refresh ScrollTrigger when layout shifts (e.g., images loading) to prevent stuck or empty scroll
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    if (reducedMotion) return;
    const context = gsap.context(() => {
      // Animate page-wide particles
      const particles = Array.from(root.querySelectorAll<HTMLElement>('[data-ambient-particle]'));
      particles.forEach((el, i) => {
        gsap.to(el, {
          x: () => gsap.utils.random(-100, 100),
          y: () => gsap.utils.random(-100, 100),
          opacity: () => gsap.utils.random(0.3, 0.8),
          duration: 5 + ((i * 7) % 10),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: gsap.utils.random(0, 3),
        });
      });

      const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
      reveals.forEach((el) => {
        gsap.fromTo(el,
          { y: 90, autoAlpha: 0, scale: 0.985 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 84%', once: true },
          });
      });

      const headingLines = Array.from(root.querySelectorAll<HTMLElement>('[data-heading-line]'));
      headingLines.forEach((line) => {
        gsap.fromTo(line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.85,
            ease: 'power2.out',
            scrollTrigger: { trigger: line, start: 'top 92%', once: true },
          }
        );
      });

      const parallax = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'));
      parallax.forEach((el, index) => {
        gsap.fromTo(el,
          { yPercent: index % 2 === 0 ? 15 : -15 },
          {
            yPercent: index % 2 === 0 ? -15 : 15,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.4 },
          });
      });
    }, root);
    return () => context.revert();
  }, [reducedMotion]);

  const renderSection = (secId: string, index: number) => {
    const heading = <SectionHeading num={`0${index + 1}`} label={t(SECTION_LABEL_KEY[secId] || secId)} />;
    const refCallback = (el: HTMLElement | null) => { sectionRefs.current[index + 1] = el; };

    if (secId === 'gallery') return (
      <section key={secId} ref={refCallback} data-reveal className="px-5 py-16 sm:px-12 sm:py-24 lg:px-16">
        {heading}
        <GallerySection items={gallery} projectTitle={project.title} />
      </section>
    );

    if (secId === 'transform') return comparison
      ? <section key={secId} ref={refCallback} data-reveal className="px-5 py-16 sm:px-12 sm:py-32 lg:px-24 border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">{heading}<TransformSection before={comparison} title={project.title} reducedMotion={reducedMotion} /></section>
      : null;

    if (secId === 'visual') return (
      <section key={secId} ref={refCallback} data-reveal className="px-5 py-16 sm:px-12 sm:py-32 lg:px-24 border-t border-white/5">{heading}<VisualSection blocks={vdBlocks} /></section>
    );

    if (secId === 'deliverables') return (
      <section key={secId} ref={refCallback} data-reveal className="px-5 py-16 sm:px-12 sm:py-32 lg:px-24 border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">{heading}<DeliverablesSection services={services} /></section>
    );

    if (secId === 'tools') return (
      <section key={secId} ref={refCallback} data-reveal className="px-5 py-16 sm:px-12 sm:py-32 lg:px-24 border-t border-white/5">{heading}<ToolsSection tools={tools} /></section>
    );

    if (secId === 'mockup' && project.fullPageMockupUrl) return (
      <section key={secId} ref={refCallback} data-reveal className="px-5 py-16 sm:px-12 sm:py-32 lg:px-24 border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        {heading}
        <div className="mx-auto mb-16 max-w-6xl text-center">
          <p className="text-sm tracking-wide text-white/50">{t('scrollInside')}</p>
        </div>
        <div className="mx-auto max-w-[1200px] h-[75vh]">
          <BrowserMockup url={project.liveUrl || 'eixglow.com'} imageUrl={project.fullPageMockupUrl} />
        </div>
        {project.liveUrl && (
          <div className="mt-12 text-center">
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#951C30] px-10 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-rose-900/30 transition hover:scale-[1.04] hover:bg-[#b8223b]">
              {t('visitLiveProject')} <ArrowUpRight className="h-5 w-5" />
            </a>
          </div>
        )}
      </section>
    );

    if (secId === 'closing' && (closingImages || finalMedia)) return (
      <section key={secId} ref={refCallback} data-reveal className="px-5 py-16 sm:px-12 sm:py-32 lg:px-24 border-t border-white/5 bg-gradient-to-b from-[#1c060f]/30 to-transparent">
        {heading}
        <ClosingSection
          images={closingImages}
          singleUrl={finalMedia}
          title={project.title}
          reducedMotion={reducedMotion}
        />
      </section>
    );

    return null;
  };

  return (
    <main ref={mainRef} className="case-study-narrative relative isolate min-h-screen overflow-x-clip overflow-y-auto bg-[#0b0107] text-white" style={{ overscrollBehavior: 'contain' }}>
      <CSSKeyframes />
      <ImageBackground />

      {/* Page-wide floating particles */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
        {Array.from({ length: 15 }, (_, i) => ({
          id: i,
          left: ((i * 37) % 101) - 1,
          top: ((i * 61) % 101) - 1,
          size: 1.5 + ((i * 13) % 4),
          dur: 5 + ((i * 7) % 10),
        })).map((dot) => (
          <i
            key={dot.id}
            data-ambient-particle
            className="absolute rounded-full bg-[#951C30]/40 shadow-[0_0_6px_rgba(149,28,48,0.4)]"
            style={{ left: `${dot.left}%`, top: `${dot.top}%`, width: dot.size, height: dot.size }}
          />
        ))}
      </div>

      {/* Fixed Left Sidebar — Growing Progress Line (no numbers) */}
      <div
        className="pointer-events-none fixed left-3 sm:left-5 top-0 bottom-0 z-30 hidden md:flex flex-col items-center"
        style={{ paddingTop: 72, paddingBottom: 72 }}
        aria-hidden="true"
      >
        <div className="relative flex-1 w-[1px]">
          {/* Background track */}
          <div className="absolute inset-0 bg-white/[0.06]" />

          {/* Burgundy fill line */}
          <div
            ref={progressRef}
            className="absolute top-0 left-0 w-full"
            style={{
              height: '0%',
              background: 'linear-gradient(to bottom, rgba(149,28,48,0.35) 0%, #951C30 100%)',
              boxShadow: '0 0 4px rgba(149,28,48,0.55)',
              transition: 'height 55ms linear',
            }}
          />

          {/* Glowing tip */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ top: '0%', transition: 'top 55ms linear' }}
          >
            <div
              style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: '#951C30',
                boxShadow: '0 0 7px 2px rgba(149,28,48,0.9), 0 0 18px 5px rgba(149,28,48,0.4)',
              }}
            />
          </div>
        </div>
      </div>


      <header className="case-study-nav relative z-20 flex items-center justify-between px-5 py-5 sm:px-12 lg:px-16">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-white/75 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">{cameFromWork ? t('allProjects') : t('backToPortfolio')}</span>
        </button>
        <div className="flex items-center gap-5">
          {project.platform && <span className="hidden text-xs md:text-sm font-black uppercase tracking-[.15em] text-white/80 sm:inline">{project.platform}</span>}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#951C30] px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-rose-900/30 transition hover:scale-[1.04] hover:bg-[#b8223b]">
              {t('liveDemo')} <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </header>

      <Hero project={project} reducedMotion={reducedMotion} />

      <div className="relative z-10 border-t border-white/5">
        {(project.year || project.platform || project.sector || (project.category && project.category !== 'Uncategorized')) && (
          <section
            data-reveal
            ref={(el) => { sectionRefs.current[0] = el; }}
            className="px-5 py-6 sm:px-12 lg:px-24"
          >
            <MetaSection project={project} />
          </section>
        )}

        {orderedSections.map((secId, i) => renderSection(secId, i))}

        <section data-reveal className="relative overflow-hidden border-t border-white/5 px-5 py-20 sm:px-12 sm:py-36 lg:px-24">
          <div className="cta-glow-orb pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] rounded-full [background:radial-gradient(circle,rgba(149,28,48,0.2)_0%,transparent_68%)]" />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 max-w-5xl">
            <p className="mb-8 text-[10px] font-black uppercase tracking-[.45em] text-[var(--accent)]">
              {t('letWorkTogether')}
            </p>

            <h2
              className="text-5xl font-black uppercase leading-[.85] tracking-[-.04em] text-white sm:text-7xl md:text-8xl"
              style={{ textShadow: '0 4px 60px rgba(0,0,0,0.8)' }}
            >
              {t('ctaTitle1')}<br />
              <em className="not-italic text-[var(--accent)]">{t('ctaTitle2')}</em><br />
              {t('ctaTitle3')}
            </h2>

            <p className="mt-8 max-w-md text-sm leading-relaxed text-white/45">
              {t('ctaSub')}
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-8">
              <Link
                href="/contact"
                className="cta-primary-btn group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#951C30] px-9 py-[1.1rem] text-xs font-bold uppercase tracking-widest text-white shadow-[0_8px_32px_rgba(149,28,48,0.45)] transition-all duration-300 hover:scale-[1.04] hover:bg-[#b8223b] hover:shadow-[0_14px_44px_rgba(149,28,48,0.65)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('startYourProject')}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </span>
                <span className="cta-shimmer absolute inset-0" aria-hidden="true" />
              </Link>

              <Link
                href="/work"
                className="group/sec inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 transition-colors duration-300 hover:text-white"
              >
                <span className="relative pb-0.5">
                  {t('backToPortfolio')}
                  <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-white/80 transition-transform duration-[400ms] group-hover/sec:scale-x-100" />
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover/sec:-translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {nextProject && <NextProjectTeaser next={nextProject} />}
    </main>
  );
}