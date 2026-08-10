'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import BrowserMockup from './BrowserMockup';

gsap.registerPlugin(ScrollTrigger);

type GalleryItem = { url: string; type: string };
type Project = {
  _id: string; slug: string; title: string; description?: string; sector?: string;
  platform?: string; services?: string[]; tools?: string[]; year?: number;
  heroMediaUrl?: string; fullPageMockupUrl?: string; gallery?: GalleryItem[];
  beforeAfter?: { before: string; after: string }[]; closingImageUrl?: string; liveUrl?: string;
};

const sceneLabels = ['Title', 'Story', 'Frames', 'Transform', 'Deliverables', 'Tools', 'Final'];

function Media({ item, alt, priority = false }: { item?: Partial<GalleryItem>; alt: string; priority?: boolean }) {
  if (!item?.url) return <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,#6a1631,transparent_45%),#16040a]" />;
  if (item.type === 'video') return <video src={item.url} autoPlay loop muted playsInline className="h-full w-full object-cover" aria-label={alt} />;
  return <Image src={item.url} alt={alt} fill unoptimized priority={priority} sizes="(min-width: 1024px) 42vw, 84vw" className="object-cover" />;
}

function ParticleTitle({ title }: { title: string }) {
  const dots = useMemo(() => Array.from({ length: 58 }, (_, index) => ({
    id: index,
    x: ((index * 47) % 101) - 50,
    y: ((index * 73) % 89) - 44,
    size: 2 + ((index * 11) % 5),
    delay: (index % 9) * 0.055,
  })), []);

  return (
    <div className="relative h-[38svh] w-full max-w-6xl" aria-label={title}>
      <div className="absolute inset-0" data-title-free-particles aria-hidden="true">
        {dots.map((dot) => <i data-title-particle key={dot.id} className="absolute left-1/2 top-1/2 rounded-full bg-rose-100" style={{ width: dot.size, height: dot.size, marginLeft: dot.x * 7, marginTop: dot.y * 6, opacity: 0.22 + (dot.id % 5) * 0.1 }} />)}
      </div>
      <svg data-title-dots viewBox="0 0 1200 340" className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={title}>
        <defs>
          <pattern id="title-dot-pattern" width="13" height="13" patternUnits="userSpaceOnUse">
            <circle cx="6.5" cy="6.5" r="3.1" fill="#fff4f6" />
          </pattern>
          <filter id="title-atmosphere"><feGaussianBlur stdDeviation="0.18" /></filter>
        </defs>
        <text x="600" y="228" textAnchor="middle" fill="url(#title-dot-pattern)" filter="url(#title-atmosphere)" style={{ fontSize: 'clamp(78px, 14vw, 225px)', fontWeight: 700, letterSpacing: '-0.09em', textTransform: 'uppercase' }}>{title}</text>
      </svg>
      <div data-title-haze className="absolute left-1/2 top-1/2 h-48 w-[65%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400/10 blur-3xl" aria-hidden="true" />
    </div>
  );
}

export default function CaseStudyPresentation({ project }: { project: Project; nextProject?: unknown }) {
  const rootRef = useRef<HTMLElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const activeSceneRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const gallery = project.gallery?.length ? project.gallery.slice(0, 5) : project.heroMediaUrl ? [{ url: project.heroMediaUrl, type: 'desktop' }] : [];
  const comparison = project.beforeAfter?.[0];
  const services = project.services?.length ? project.services : ['Art direction', 'Visual identity', 'Digital experience'];
  const tools = project.tools?.length ? project.tools : [project.platform || 'Digital', 'Strategy', 'Design'];
  const finalMedia = project.closingImageUrl || project.heroMediaUrl;
  const description = project.description || 'A focused visual system designed to make every interaction feel intentional.';
  const descriptionWords = description.split(' ');

  useLayoutEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useLayoutEffect(() => {
    if (!rootRef.current || reducedMotion) return;
    const root = rootRef.current;
    const context = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const scenes = q('[data-scene]');
      const titleParticles = q('[data-title-particle]');
      const galleryCards = q('[data-gallery-card]');
      const serviceItems = q('[data-service]');
      const toolItems = q('[data-tool]');
      const scene = (index: number) => q(`[data-scene="${index}"]`);

      gsap.set(scenes, { autoAlpha: 0 });
      gsap.set(scene(0), { autoAlpha: 1 });
      gsap.set(q('[data-title-dots]'), { autoAlpha: 0, scale: 0.74, transformOrigin: '50% 50%' });
      gsap.set(titleParticles, { x: () => gsap.utils.random(-460, 460), y: () => gsap.utils.random(-300, 300), z: () => gsap.utils.random(-600, 200), opacity: () => gsap.utils.random(0.18, 0.82) });
      gsap.set(q('[data-description-word]'), { y: 30, z: -100, rotationX: -30, autoAlpha: 0.1, scale: 0.8, color: 'rgba(255,255,255,0.2)' });
      
      // Initialize gallery cards for flipping stack
      gsap.set(galleryCards, { z: -400, rotationY: 0, rotationX: 10, scale: 0.82, autoAlpha: 0 });
      
      gsap.set(q('[data-ba-stage]'), { z: -580, rotationY: 12, scale: 0.72, autoAlpha: 0 });
      gsap.set(q('[data-before-after]'), { clipPath: 'inset(0 100% 0 0)' });
      gsap.set(serviceItems, { y: 120, z: -300, rotationX: 42, autoAlpha: 0 });
      gsap.set(toolItems, { scale: 0.35, z: -600, autoAlpha: 0 });
      gsap.set(q('[data-final]'), { scale: 0.76, z: -500, autoAlpha: 0 });

      const updateActive = (progress: number) => {
        const budgets = [1.4, 1.15, 0.7 + galleryCards.length * 0.4, 1.45, 1.1, 1.15, 0.9];
        const total = budgets.reduce((sum, budget) => sum + budget, 0);
        let elapsed = 0;
        const stops = budgets.map((budget) => { elapsed += budget; return elapsed / total; });
        const next = stops.findIndex((stop) => progress <= stop);
        const index = next === -1 ? 6 : next;
        if (activeSceneRef.current !== index) { activeSceneRef.current = index; setActiveScene(index); }
      };

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.55, invalidateOnRefresh: true, onUpdate: (self) => updateActive(self.progress) },
      });

      timeline
        .to(titleParticles, { x: (i) => ((i % 9) - 4) * 13, y: (i) => (Math.floor(i / 9) - 3) * 10, z: 0, opacity: 0.28, duration: 0.65, stagger: 0.006, ease: 'power3.out' })
        .to(q('[data-title-dots]'), { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'power4.out' }, '<0.18')
        .to(q('[data-title-haze]'), { scale: 1.5, opacity: 0.36, duration: 0.3 }, '<')
        .to(scene(0), { z: -440, scale: 0.84, autoAlpha: 0, duration: 0.2, ease: 'power2.in' })
        .set(scene(1), { autoAlpha: 1 })
        // Sped up stagger for text words
        .to(q('[data-description-word]'), { y: 0, z: 0, rotationX: 0, autoAlpha: 1, scale: 1, color: '#ffffff', stagger: 0.015, duration: 0.5, ease: 'back.out(2)' })
        .to(scene(1), { y: -70, z: -340, autoAlpha: 0, duration: 0.45, ease: 'power2.inOut' })
        .set(scene(2), { autoAlpha: 1 });

      // Flipping Gallery Animation
      galleryCards.forEach((card, index) => {
        timeline.to(galleryCards, {
          xPercent: 0,
          z: (i) => {
            if (i === index) return 200; // active is close
            if (i > index) return -150 - ((i - index) * 80); // future ones are stacked behind
            return -800; // past ones are pushed WAY back
          },
          rotationY: 0,
          rotationX: (i) => {
            if (i === index) return 0; // flat
            if (i > index) return 5; // slightly tilted up
            return -60; // past ones flip backwards "تتشقلب وترجع"
          },
          scale: (i) => i === index ? 1.6 : (i > index ? 0.9 : 0.4),
          autoAlpha: (i) => i === index ? 1 : (i > index ? 0.4 : 0),
          duration: 0.45,
          ease: 'power3.inOut',
          overwrite: 'auto',
        });
      });

      timeline
        .to(galleryCards, { z: -800, rotationX: -60, scale: 0.4, autoAlpha: 0, duration: 0.3, ease: 'power3.in' })
        .to(scene(2), { autoAlpha: 0, duration: 0.08 })
        .set(scene(3), { autoAlpha: 1 })
        .to(q('[data-ba-stage]'), { z: 0, rotationY: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: 'power4.out' })
        .to(q('[data-before-after]'), { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power3.inOut' })
        .to(q('[data-before-image]'), { scale: 1.1, duration: 0.2 }, '<')
        .to(scene(3), { z: -430, rotationX: 8, autoAlpha: 0, duration: 0.25 })
        .set(scene(4), { autoAlpha: 1 })
        .to(serviceItems, { y: 0, z: 0, rotationX: 0, autoAlpha: 1, stagger: 0.1, duration: 0.65, ease: 'power4.out' })
        .to(scene(4), { z: -350, autoAlpha: 0, duration: 0.45 })
        .set(scene(5), { autoAlpha: 1 })
        .to(toolItems, { scale: 1, z: 0, autoAlpha: 1, stagger: 0.08, duration: 0.7, ease: 'back.out(1.25)' })
        .to(q('[data-tools-core]'), { rotation: 180, scale: 1.22, duration: 0.45, ease: 'power2.inOut' }, '<')
        .to(scene(5), { z: -500, autoAlpha: 0, duration: 0.45 })
        .set(scene(6), { autoAlpha: 1 })
        .to(q('[data-final]'), { scale: 1, z: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.out' });
    }, root);
    return () => context.revert();
  }, [project.slug, reducedMotion, gallery.length, services.length, tools.length]);

  if (reducedMotion) return <StaticCaseStudy project={project} gallery={gallery} comparison={comparison} services={services} tools={tools} finalMedia={finalMedia} />;

  return (
    <>
      <main ref={rootRef} className="case-study-cinematic case-study-narrative relative bg-[#17030a] text-white" style={{ minHeight: `${800 + gallery.length * 60}svh` }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden [perspective:1400px]">
          <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-5 py-5 sm:px-8 md:px-12">
            <Link href="/work" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-white/75 transition hover:text-white"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">All projects</span></Link>
            <div className="hidden gap-1 sm:flex">{sceneLabels.map((label, index) => <span key={label} title={label} className="h-1 rounded-full transition-all duration-200" style={{ width: index === activeScene ? 24 : 5, background: index <= activeScene ? 'var(--accent)' : 'rgba(255,255,255,.25)' }} />)}</div>
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[var(--accent)]">Live <ExternalLink className="h-3.5 w-3.5" /></a>}
          </header>
          <div className="pointer-events-none absolute inset-0 opacity-45 [background:radial-gradient(circle_at_50%_35%,rgba(183,35,77,.2),transparent_30%),linear-gradient(115deg,transparent_48%,rgba(255,255,255,.035)_49%,transparent_50%)]" />
          <p className="absolute bottom-7 left-5 z-30 text-[10px] font-bold uppercase tracking-[.35em] text-white/45 sm:left-8">{String(activeScene + 1).padStart(2, '0')} / 07 · scroll to direct</p>

          <section data-scene="0" className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center"><p className="mb-6 text-[10px] font-bold uppercase tracking-[.48em] text-[var(--accent)]">{project.sector || 'Project'} · {project.year}</p><ParticleTitle title={project.title} /></section>
          <section data-scene="1" className="absolute inset-0 flex items-center px-5 sm:px-12 lg:px-[12vw]"><div className="max-w-5xl [transform-style:preserve-3d]"><p className="mb-10 text-[10px] font-bold uppercase tracking-[.42em] text-[var(--accent)]">The brief</p><div className="flex flex-wrap gap-x-3 sm:gap-x-5 gap-y-2 sm:gap-y-4">{descriptionWords.map((word, index) => <span data-description-word key={index} className="inline-block origin-bottom text-[clamp(1.8rem,4.5vw,4.5rem)] font-bold leading-[1.1] tracking-[-.04em] text-white/90">{word}</span>)}</div></div></section>
          
          {/* Flipped Gallery Scene */}
          <section data-scene="2" className="absolute inset-0 flex items-center justify-center overflow-hidden px-5"><div className="relative flex w-max items-center justify-center [transform-style:preserve-3d]">{gallery.map((item, index) => <figure data-gallery-card key={`${item.url}-${index}`} className="absolute h-[clamp(16rem,45vw,30rem)] w-[clamp(10rem,22vw,20rem)] shrink-0 overflow-hidden border border-white/15 bg-[#230712] shadow-2xl [transform-style:preserve-3d]" style={{ marginLeft: '-10vw', marginTop: '-15vw' }}><Media item={item} alt={`${project.title} frame ${index + 1}`} priority={index === 0} /><figcaption className="absolute bottom-3 left-3 text-[9px] font-bold uppercase tracking-[.25em] text-white/65">Frame {String(index + 1).padStart(2, '0')}</figcaption></figure>)}</div></section>
          
          <section data-scene="3" className="absolute inset-0 flex items-center justify-center px-5"><div data-ba-stage className="relative aspect-video w-full max-w-5xl overflow-hidden border border-white/15 bg-[#230712] [transform-style:preserve-3d]">{comparison ? <><div data-before-image className="absolute inset-0"><Media item={{ url: comparison.before }} alt="Before" /></div><div data-before-after className="absolute inset-0"><Media item={{ url: comparison.after }} alt="After" /></div></> : <Media item={gallery[0]} alt={project.title} />}<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,.12),transparent_24%,transparent_70%,rgba(0,0,0,.3))]" /><span className="absolute bottom-5 left-5 text-[10px] font-bold uppercase tracking-[.34em]">Before</span><span className="absolute bottom-5 right-5 text-[10px] font-bold uppercase tracking-[.34em]">After</span></div></section>
          <section data-scene="4" className="absolute inset-0 flex items-center justify-center px-5"><div className="grid w-full max-w-6xl gap-3 md:grid-cols-2">{services.map((service, index) => <div data-service key={service} className="flex min-h-28 items-end border border-white/15 bg-white/[.035] p-5 [transform-style:preserve-3d]"><span className="mr-4 text-[10px] text-[var(--accent)]">0{index + 1}</span><span className="text-2xl font-medium tracking-[-.04em] sm:text-4xl">{service}</span></div>)}</div></section>
          <section data-scene="5" className="absolute inset-0 flex items-center justify-center overflow-hidden px-5"><div data-tools-core className="absolute h-28 w-28 rounded-full border border-[var(--accent)] bg-[var(--accent)]/10" />{tools.map((tool, index) => { const angle = 360 / tools.length * index; return <span data-tool key={tool} className="absolute flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-[#21060e] px-2 text-center text-[10px] font-bold uppercase tracking-wider sm:h-28 sm:w-28" style={{ transform: `rotate(${angle}deg) translateY(clamp(-13rem, -26vw, -7rem)) rotate(${-angle}deg)` }}>{tool}</span>; })}</section>
          <section data-scene="6" className="absolute inset-0 flex items-center justify-center px-5 py-20"><div data-final className="relative flex h-full max-h-[72svh] w-full max-w-6xl items-end overflow-hidden border border-white/15 bg-[#21060e] p-6 sm:p-10"><Media item={finalMedia ? { url: finalMedia } : undefined} alt={`${project.title} final preview`} /><div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(17,2,7,.94)_100%)]" /><div className="relative z-10"><p className="text-[10px] font-bold uppercase tracking-[.38em] text-[var(--accent)]">End of project</p><h2 className="mt-3 max-w-3xl text-5xl font-semibold uppercase leading-[.8] tracking-[-.08em] sm:text-7xl">{project.title}</h2></div></div></section>
        </div>
      </main>

      {/* Standard Scrolling Section for Full Page Mockup */}
      {project.fullPageMockupUrl && (
        <section className="relative z-10 bg-[#110205] py-24 px-5 sm:px-12 border-t border-rose-900/30">
          <div className="max-w-6xl mx-auto mb-16 text-center">
            <h3 className="text-3xl font-light tracking-tight text-white mb-4">Explore the Full Experience</h3>
            <p className="text-white/50 text-sm tracking-wide">Scroll inside the window to view the complete design.</p>
          </div>
          <BrowserMockup imageUrl={project.fullPageMockupUrl} />
          
          <div className="mt-24 text-center pb-12 flex flex-col items-center gap-6">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80" style={{ backgroundColor: '#951C30' }}>
                Visit live project <ArrowUpRight className="h-4" />
              </a>
            )}
            <Link href="/work" className="inline-flex items-center gap-2 border-b border-white/40 pb-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">
              Back to portfolio <ArrowLeft className="h-4" />
            </Link>
          </div>
        </section>
      )}
      
      {!project.fullPageMockupUrl && (
        <section className="bg-[#110205] py-24 text-center flex flex-col items-center gap-6 border-t border-rose-900/30">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80" style={{ backgroundColor: '#951C30' }}>
              Visit live project <ArrowUpRight className="h-4" />
            </a>
          )}
          <Link href="/work" className="inline-flex items-center gap-2 border-b border-white/40 pb-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">
            Back to portfolio <ArrowLeft className="h-4" />
          </Link>
        </section>
      )}
    </>
  );
}

function StaticCaseStudy({ project, gallery, comparison, services, tools, finalMedia }: { project: Project; gallery: GalleryItem[]; comparison?: { before: string; after: string }; services: string[]; tools: string[]; finalMedia?: string }) {
  const section = (label: string, content: React.ReactNode) => <section className="min-h-[74svh] px-5 py-24 sm:px-8"><p className="mb-7 text-[10px] font-bold uppercase tracking-[.36em] text-[var(--accent)]">{label}</p>{content}</section>;
  return <main className="case-study-narrative min-h-screen bg-[#17030a] text-white"><header className="sticky top-0 z-20 flex justify-between bg-[#17030a]/90 px-5 py-5 backdrop-blur sm:px-8"><Link href="/work" className="text-xs font-bold uppercase tracking-widest"><ArrowLeft className="mr-2 inline h-4" />All projects</Link>{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Live site</a>}</header>{section('01 — Project', <><h1 className="text-6xl font-semibold uppercase leading-[.8] tracking-[-.08em] sm:text-8xl">{project.title}</h1><p className="mt-10 max-w-xl text-lg leading-relaxed text-white/70">{project.description}</p></>)}{section('02 — Gallery', <div className="grid gap-5 sm:grid-cols-2">{gallery.map((item, index) => <div key={item.url} className="relative aspect-[4/3] overflow-hidden"><Media item={item} alt={`${project.title} gallery ${index + 1}`} /></div>)}</div>)}{section('03 — Transformation', comparison ? <div className="relative aspect-video overflow-hidden"><Media item={{ url: comparison.after }} alt="After" /><div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"><div className="relative h-full w-[200%]"><Media item={{ url: comparison.before }} alt="Before" /></div></div></div> : <p className="text-white/60">The final outcome is shown in the project frames.</p>)}{section('04 — Deliverables', <div className="flex flex-wrap gap-3">{services.map((service) => <span key={service} className="border border-white/20 px-5 py-3">{service}</span>)}</div>)}{section('05 — Tools', <div className="flex flex-wrap gap-3">{tools.map((tool) => <span key={tool} className="rounded-full border border-white/20 px-5 py-3">{tool}</span>)}</div>)}{section('06 — Final', <><div className="relative aspect-video overflow-hidden"><Media item={finalMedia ? { url: finalMedia } : undefined} alt={project.title} /></div><Link href="/work" className="mt-8 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Back to portfolio <ArrowLeft className="h-4 rotate-180" /></Link></>)}
  
  {/* Static Mockup */}
  {project.fullPageMockupUrl && (
    <section className="px-5 py-24 sm:px-8 border-t border-rose-900/30 bg-[#110205]">
      <div className="max-w-6xl mx-auto mb-16 text-center">
        <h3 className="text-3xl font-light tracking-tight text-white mb-4">Explore the Full Experience</h3>
        <p className="text-white/50 text-sm tracking-wide">Scroll inside the window to view the complete design.</p>
      </div>
      <BrowserMockup imageUrl={project.fullPageMockupUrl} />
    </section>
  )}
  </main>;
}
