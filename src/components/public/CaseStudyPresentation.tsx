'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import BrowserMockup from './BrowserMockup';

gsap.registerPlugin(ScrollTrigger);

/* ─── Types ─────────────────────────────────────────────── */
type GalleryItem = { url: string; type: string };
type VisualDirection = { colors?: string[]; fonts?: string[]; identity?: string[]; imageStyle?: string[] };
type Project = {
  _id: string; slug: string; title: string; description?: string;
  sector?: string; category?: string; platform?: string;
  services?: string[]; tools?: string[]; year?: number;
  heroMediaUrl?: string; fullPageMockupUrl?: string; gallery?: GalleryItem[];
  beforeAfter?: { before: string; after: string }[]; closingImageUrl?: string; closingImages?: string[]; liveUrl?: string;
  visualDirection?: VisualDirection; sectionOrder?: string[];
};
type NextProject = {
  slug: string; title: string; sector?: string; heroMediaUrl?: string; year?: number;
};

const DEFAULT_SECTION_ORDER = ['gallery', 'transform', 'visual', 'deliverables', 'tools', 'mockup'] as const;
const SECTION_LABEL: Record<string, string> = {
  gallery: 'Frames',
  transform: 'Transformation',
  visual: 'Visual Direction',
  deliverables: 'Deliverables',
  tools: 'Tools',
  mockup: 'Full Experience',
};

const ARABIC_RANGE = /[\u0600-\u06FF\u0750-\u077F]/;

/* ─── Media ──────────────────────────────────────────────── */
function Media({ item, alt, priority = false }: { item?: Partial<GalleryItem>; alt: string; priority?: boolean }) {
  if (!item?.url) return <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,#6a1631,transparent_45%),#16040a]" />;
  if (item.type === 'video') return <video src={item.url} autoPlay loop muted playsInline className="h-full w-full object-cover" aria-label={alt} />;
  // Use plain <img> for GIFs so animation is preserved (next/image kills GIF animation)
  if (item.type === 'gif') return <img src={item.url} alt={alt} className="h-full w-full object-cover" loading={priority ? 'eager' : 'lazy'} />;
  return <Image src={item.url} alt={alt} fill unoptimized priority={priority} sizes="(min-width: 1024px) 50vw, 92vw" className="object-cover" />;
}

/* ─── ImageBackground — fixed, covers full page ──────── */
function ImageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full select-none overflow-hidden bg-[#0b0107]">
      <div className="absolute inset-0 h-full w-full">
        <Image
          src="/images/satin-bg.jpg"
          alt="Satin background"
          fill
          quality={100}
          className="object-cover opacity-70"
          priority
        />
      </div>
      {/* Gradient overlay to ensure text readability without performance-heavy mix-blend modes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0107]/40 via-[#0b0107]/60 to-[#0b0107]/95" />
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
function Hero({ project, reducedMotion }: { project: Project; reducedMotion: boolean }) {
  const heroRef = useRef<HTMLElement>(null);

  const ambientDots = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
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

      gsap.set(title, { opacity: 0, y: 50, scale: 0.95, filter: 'blur(12px)' });
      gsap.set(desc, { opacity: 0, y: 20, filter: 'blur(8px)' });
      gsap.set('[data-hero-cta]', { autoAlpha: 0, y: 20 });

      const tl = gsap.timeline({ delay: 0.1 });
      
      tl.to(title, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power4.out' })
        .to(desc, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' }, '-=0.9')
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
          className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-[#fdf2f4] will-change-[opacity,transform,filter]"
          style={{ textShadow: '0 4px 40px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.8)' }}
        >
          {project.title}
        </h1>
      </div>

      <div className="relative mt-8 max-w-3xl text-[clamp(1.05rem,2.3vw,1.9rem)] font-medium leading-snug tracking-[-.01em] text-[#f4d7dd]" dir="auto">
        <p data-hero-desc className="opacity-0 translate-y-6 will-change-[opacity,transform,filter]">{project.description || 'A focused visual system designed to make every interaction feel intentional.'}</p>
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

/* ─── Section Heading ────────────────────────────────────── */
function SectionHeading({ num, label, sub }: { num: string; label: string; sub?: string }) {
  return (
    <div className="mb-12 max-w-3xl">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs sm:text-sm font-black uppercase tracking-[.35em] text-[var(--accent)] opacity-90">{num}</span>
        <span className="h-px flex-1 max-w-[40px] bg-[var(--accent)]/40" />
        <span className="text-xs sm:text-sm font-black uppercase tracking-[.35em] text-[var(--accent)] opacity-90">{label}</span>
      </div>
      {sub && (
        <p className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-[-.02em] text-white mt-4" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Gallery Section (Bento Grid) ───────────────────────── */
function GallerySection({ items, projectTitle }: { items: GalleryItem[]; projectTitle: string }) {
  if (!items.length) return null;

  const getGridClasses = (type?: string) => {
    // Determine layout dynamically based on the type defined in the CMS
    const t = (type || '').toLowerCase();
    
    // For mobile, default to 1 col / 1 row, but for desktop, create the bento spans
    if (t === 'mobile' || t === 'mopail') {
      return 'col-span-1 md:col-span-1 md:row-span-2'; // Tall
    }
    if (t === 'desktop') {
      return 'col-span-1 md:col-span-2 md:row-span-2'; // Large block
    }
    if (t === 'mockup' || t === 'mocup') {
      return 'col-span-1 md:col-span-2 md:row-span-1'; // Wide block
    }
    if (t === 'video' || t === 'vidio') {
      return 'col-span-1 md:col-span-2 md:row-span-2'; // Large block for video
    }
    
    // Default fallback
    return 'col-span-1 md:col-span-1 md:row-span-1';
  };

  const Frame = ({ item, index }: { item: GalleryItem; index: number }) => (
    <figure
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#1c060f] group ${getGridClasses(item.type)}`}
    >
      <Media item={item} alt={`${projectTitle} frame ${index + 1}`} />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </figure>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] gap-4 md:gap-5 grid-flow-dense">
      {items.map((item, i) => <Frame key={`${item.url}-${i}`} item={item} index={i} />)}
    </div>
  );
}

/* ─── Visual Direction ───────────────────────────────────── */
function VisualSection({ blocks }: { blocks: { id: string; label: string; items: string[] }[] }) {
  if (!blocks.length) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {blocks.map((block, bi) => (
        <div key={block.id} data-parallax className="flex min-h-32 flex-col justify-end border border-white/10 bg-white/[.03] p-6 will-change-transform" style={{ marginTop: `${16 + bi * 10}px` }}>
          <p className="text-[10px] uppercase tracking-[.3em] text-[var(--accent)]">{block.label}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {block.id === 'colors'
              ? block.items.map((it) => <span key={it} className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs tracking-wide"><i className="h-3 w-3 rounded-full border border-white/10" style={{ background: it }} />{it.toLowerCase()}</span>)
              : block.items.map((it) => <span key={it} className="rounded-full border border-white/10 px-3 py-1.5 text-xs tracking-wide">{it}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Before / After ─────────────────────────────────────── */
function TransformSection({ before, title, reducedMotion }: { before: { before: string; after: string }; title: string; reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const wipeTl = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || reducedMotion) return;
    const context = gsap.context(() => {
      gsap.set('[data-transform-wipe]', { clipPath: 'inset(0 100% 0 0)' });

      wipeTl.current = gsap.to('[data-transform-wipe]', {
        clipPath: 'inset(0 0% 0 0)',
        duration: 3.5, // Much slower
        ease: 'power2.inOut',
        paused: true,
      });

      ScrollTrigger.create({
        trigger: root,
        start: 'top 68%',
        end: 'bottom top',
        toggleActions: 'play none none reverse', // Replays when scrolling back up
        animation: wipeTl.current,
      });

      gsap.fromTo('[data-transform-stage]',
        { y: 70, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: root, start: 'top 82%', toggleActions: 'play none none reverse' },
        });
    }, root);
    return () => context.revert();
  }, [reducedMotion, before.before, before.after]);

  const handleReplay = () => {
    if (wipeTl.current) {
      wipeTl.current.restart();
    }
  };

  return (
    <div ref={ref} data-transform-stage data-gsap-context-root className="will-change-transform">
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-[#1c060f] lg:aspect-[21/9] cursor-pointer group"
        onClick={handleReplay}
        title="Click to replay transformation"
      >
        <Media item={{ url: before.after }} alt={`${title} — After`} />
        <div data-transform-wipe className="absolute inset-0">
          <Media item={{ url: before.before }} alt={`${title} — Before`} />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-px -translate-x-1/2 bg-white/30 lg:block" />

        {/* Labels */}
        <span className="absolute bottom-3 left-3 z-20 rounded bg-black/55 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.22em] text-white/85 backdrop-blur transition-opacity group-hover:opacity-100 opacity-70">Before</span>
        <span className="absolute bottom-3 right-3 z-20 rounded bg-black/55 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.22em] text-white/85 backdrop-blur transition-opacity group-hover:opacity-100 opacity-70">After</span>

        {/* Replay Overlay */}
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-full bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
            Click to Replay
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Deliverables (services as cards) ──────────────────── */
function DeliverablesSection({ services }: { services: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {services.map((service, index) => (
        <div
          key={service}
          data-parallax
          className="flex min-h-28 items-center gap-5 border border-white/10 bg-white/[.03] p-6 will-change-transform transition-colors hover:border-[var(--accent)]/25 hover:bg-white/[.05]"
          style={{ marginTop: `${(index % 2 === 0 ? 0 : 22)}px` }}
        >
          <span className="text-[10px] font-bold text-[var(--accent)]">0{index + 1}</span>
          <span className="text-lg font-medium tracking-[-.03em] text-white/90 sm:text-xl">{service}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Tools ──────────────────────────────────────────────── */
function ToolsSection({ tools }: { tools: string[] }) {
  return (
    <div className="flex max-w-4xl flex-wrap gap-4">
      {tools.map((tool, i) => (
        <span
          key={tool}
          data-parallax
          className="rounded-xl border border-white/20 bg-white/[.06] px-6 py-3.5 text-lg sm:text-xl font-medium tracking-wide text-white/95 will-change-transform"
          style={{ marginTop: `${(i % 2 === 0 ? 0 : 18)}px` }}
        >
          {tool}
        </span>
      ))}
    </div>
  );
}

/* ─── Project Meta (real schema fields only) ─────────────── */
function MetaSection({ project }: { project: Project }) {
  // Only render fields that actually exist in the Project schema with real data.
  // Never substitute an unrelated field (e.g. title is NOT client).
  const fields: { label: string; value: string }[] = [];

  if (project.year) fields.push({ label: 'Year', value: String(project.year) });
  if (project.platform) fields.push({ label: 'Platform', value: project.platform });

  // sector and category are separate optional schema fields — show each when present
  if (project.sector) fields.push({ label: 'Sector', value: project.sector });
  if (project.category && project.category !== 'Uncategorized')
    fields.push({ label: 'Category', value: project.category });

  if (!fields.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {fields.map(({ label, value }) => (
        <div key={label} className="rounded-xl border border-white/10 bg-white/[.03] px-6 py-6 backdrop-blur-sm shadow-xl shadow-black/20">
          <p className="mb-3 text-[10px] md:text-xs font-black uppercase tracking-[.3em] text-[var(--accent)]">{label}</p>
          <p className="text-lg md:text-xl font-bold text-white leading-snug">{value}</p>
        </div>
      ))}
    </div>
  );
}



/* ─── Next Project Teaser ────────────────────────────────── */
function NextProjectTeaser({ next }: { next: NextProject }) {
  return (
    <div className="border-t border-white/5">
      <Link
        href={`/work/${next.slug}`}
        className="group relative flex min-h-[42vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center"
        aria-label={`Next project: ${next.title}`}
      >
        {/* Background hero image with parallax-on-hover depth */}
        {next.heroMediaUrl && (
          <div className="pointer-events-none absolute inset-0 scale-[1.08] transition-transform duration-700 ease-out group-hover:scale-100">
            <Image
              src={next.heroMediaUrl}
              alt=""
              fill
              unoptimized
              className="object-cover opacity-15 transition-opacity duration-500 group-hover:opacity-25"
            />
          </div>
        )}
        {/* Dark overlay that lifts slightly on hover */}
        <div className="pointer-events-none absolute inset-0 bg-[#0b0107]/75 transition-opacity duration-500 group-hover:bg-[#0b0107]/55" />

        {/* Content */}
        <div className="relative z-10">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[.55em] text-[var(--accent)]">Next Project</p>
          <h3 className="text-3xl font-bold tracking-tight text-white transition-transform duration-500 group-hover:-translate-y-1 sm:text-5xl">
            {next.title}
          </h3>
          {(next.sector || next.year) && (
            <p className="mt-2 text-xs text-white/35">
              {[next.sector, next.year].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.35em] text-white/50 transition-colors duration-300 group-hover:text-white">
            View Case Study <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function CaseStudyPresentation({ project, nextProject }: { project: Project; nextProject?: NextProject }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const gallery = project.gallery?.length ? project.gallery : project.heroMediaUrl ? [{ url: project.heroMediaUrl, type: 'desktop' }] : [];
  const comparison = project.beforeAfter?.[0];
  const services = project.services?.length ? project.services : ['Art direction', 'Visual identity', 'Digital experience'];
  const tools = project.tools?.length ? project.tools : [project.platform || 'Digital', 'Strategy', 'Design'];
  const finalMedia = project.closingImageUrl;
  const closingImages = project.closingImages?.length ? project.closingImages : null;
  const description = project.description || 'A focused visual system designed to make every interaction feel intentional.';



  const vdColors = useMemo(() => project.visualDirection?.colors?.filter(Boolean) || [], [project.visualDirection]);
  const vdFonts = useMemo(() => project.visualDirection?.fonts?.filter(Boolean) || [], [project.visualDirection]);
  const vdIdentity = useMemo(() => project.visualDirection?.identity?.filter(Boolean) || [], [project.visualDirection]);
  const vdImageStyle = useMemo(() => project.visualDirection?.imageStyle?.filter(Boolean) || [], [project.visualDirection]);
  const hasVisual = Boolean(vdColors.length || vdFonts.length || vdIdentity.length || vdImageStyle.length);

  const vdBlocks = useMemo(() => {
    const blocks: { id: string; label: string; items: string[] }[] = [];
    if (vdColors.length) blocks.push({ id: 'colors', label: 'Color', items: vdColors });
    if (vdFonts.length) blocks.push({ id: 'fonts', label: 'Type', items: vdFonts });
    if (vdIdentity.length) blocks.push({ id: 'identity', label: 'Identity', items: vdIdentity });
    if (vdImageStyle.length) blocks.push({ id: 'imageStyle', label: 'Art Direction', items: vdImageStyle });
    return blocks;
  }, [vdColors, vdFonts, vdIdentity, vdImageStyle]);

  const orderedSections = useMemo(() => {
    const raw: string[] = project.sectionOrder?.length ? project.sectionOrder : (DEFAULT_SECTION_ORDER as unknown as string[]);
    let list = raw.filter((s) => (DEFAULT_SECTION_ORDER as unknown as string[]).includes(s));
    list = list.filter((s) => s !== 'visual' || hasVisual);
    list = list.filter((s) => s !== 'mockup' || Boolean(project.fullPageMockupUrl));
    return [...new Set(list)];
  }, [project.sectionOrder, hasVisual, project.fullPageMockupUrl]);



  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    if (reducedMotion) return;
    const context = gsap.context(() => {
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
    const heading = <SectionHeading num={`0${index + 1}`} label={SECTION_LABEL[secId] || secId} />;

    if (secId === 'gallery') return (
      <section key={secId} data-reveal className="px-5 py-24 sm:px-12 lg:px-16">
        {heading}
        <GallerySection items={gallery} projectTitle={project.title} />
      </section>
    );

    if (secId === 'transform') return comparison
      ? <section key={secId} data-reveal className="px-5 py-32 sm:px-12 lg:px-24 border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">{heading}<TransformSection before={comparison} title={project.title} reducedMotion={reducedMotion} /></section>
      : null;

    if (secId === 'visual') return (
      <section key={secId} data-reveal className="px-5 py-32 sm:px-12 lg:px-24 border-t border-white/5">{heading}<VisualSection blocks={vdBlocks} /></section>
    );

    if (secId === 'deliverables') return (
      <section key={secId} data-reveal className="px-5 py-32 sm:px-12 lg:px-24 border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">{heading}<DeliverablesSection services={services} /></section>
    );

    if (secId === 'tools') return (
      <section key={secId} data-reveal className="px-5 py-32 sm:px-12 lg:px-24 border-t border-white/5">{heading}<ToolsSection tools={tools} /></section>
    );

    if (secId === 'mockup' && project.fullPageMockupUrl) return (
      <section key={secId} data-reveal className="px-5 py-32 sm:px-12 lg:px-24 border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        {heading}
        <div className="mx-auto mb-16 max-w-6xl text-center">
          <p className="text-sm tracking-wide text-white/50">Scroll inside the window to view the complete design.</p>
        </div>
        <BrowserMockup imageUrl={project.fullPageMockupUrl} />
        {project.liveUrl && (
          <div className="mt-16 text-center">
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#951C30] px-10 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-rose-900/30 transition hover:scale-[1.04] hover:bg-[#b8223b]">
              Visit live project <ArrowUpRight className="h-5 w-5" />
            </a>
          </div>
        )}
      </section>
    );

    return null;
  };

  return (
    <main ref={mainRef} className="case-study-narrative relative isolate min-h-screen overflow-x-clip bg-[#0b0107] text-white">
      {/* Background image covers the full scroll experience via `fixed inset-0` */}
      <ImageBackground />

      {/* ── Navigation ───────────────────────────────────── */}
      <header className="case-study-nav relative z-20 flex items-center justify-between px-5 py-5 sm:px-12 lg:px-16">
        <Link href="/work" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-white/75 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">All projects</span>
        </Link>
        <div className="flex items-center gap-5">
          {project.platform && <span className="hidden text-xs md:text-sm font-black uppercase tracking-[.15em] text-white/80 sm:inline">{project.platform}</span>}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#951C30] px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-rose-900/30 transition hover:scale-[1.04] hover:bg-[#b8223b]">
              Live Demo <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <Hero project={project} reducedMotion={reducedMotion} />

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="relative z-10 border-t border-white/5">

        {/* Project Meta — real schema fields only, omitted if no data */}
        {(project.year || project.platform || project.sector || (project.category && project.category !== 'Uncategorized')) && (
          <section data-reveal className="px-5 py-32 sm:px-12 lg:px-24">
            <SectionHeading num="00" label="Project Details" />
            <MetaSection project={project} />
          </section>
        )}

        {/* Ordered sections (deliverables, tools, gallery, transform, visual) */}
        {orderedSections.map((secId, i) => renderSection(secId, i))}

        {/* ── Final / Closing CTA ──────────────────────── */}
        {(closingImages || finalMedia) && (
          <section data-reveal className="px-5 py-32 sm:px-12 lg:px-24 border-t border-white/5 bg-gradient-to-b from-[#1c060f]/40 to-transparent">
            <SectionHeading num="06" label="Final" sub="End of project" />
            
            <div className="mb-16">
              {closingImages ? (
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  {closingImages.map((url, i) => (
                    <div key={i} className="relative overflow-hidden border border-white/10 bg-[#1c060f] rounded-xl will-change-transform flex-grow flex-shrink basis-[calc(50%-1rem)] min-w-[300px]">
                      <Media item={{ url, type: 'desktop' }} alt={`${project.title} — closing image ${i + 1}`} />
                    </div>
                  ))}
                </div>
              ) : finalMedia ? (
                <div data-parallax className="relative overflow-hidden border border-white/10 bg-[#1c060f] rounded-xl will-change-transform aspect-[16/10] lg:aspect-[21/9]">
                  <Media item={{ url: finalMedia, type: 'desktop' }} alt={`${project.title} — final preview`} />
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ) : null}
            </div>

            <div className="relative z-10 px-6 sm:px-10 max-w-4xl">
              <h2 className="text-4xl font-semibold uppercase leading-[.85] tracking-[-.07em] sm:text-6xl">{project.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/60">Have a similar project? Let&apos;s create a visual experience that reflects your brand.</p>
              <div className="mt-7 flex flex-wrap items-center gap-6">
                <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-[#951C30] px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80">
                  Start your project <ArrowUpRight className="h-4" />
                </Link>
                <Link href="/work" className="inline-flex items-center gap-2 border-b border-white/40 pb-2 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:text-white">
                  Back to portfolio <ArrowLeft className="h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── Next project teaser ───────────────────────────── */}
      {nextProject && <NextProjectTeaser next={nextProject} />}
    </main>
  );
}