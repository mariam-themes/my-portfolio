import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryItem, Project } from '@/types/case-study';
import { Media } from './Shared';
import BrowserMockup from '../BrowserMockup';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function GallerySection({ items, projectTitle }: { items: GalleryItem[]; projectTitle: string }) {
  if (!items.length) return null;

  const getGridClasses = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t === 'mobile' || t === 'mopail') return 'col-span-1 md:col-span-1 md:row-span-2';
    if (t === 'desktop') return 'col-span-1 md:col-span-2 md:row-span-2';
    if (t === 'mockup' || t === 'mocup') return 'col-span-1 md:col-span-2 md:row-span-1';
    if (t === 'video' || t === 'vidio') return 'col-span-1 md:col-span-2 md:row-span-2';
    return 'col-span-1 md:col-span-1 md:row-span-1';
  };

  const Frame = ({ item, index }: { item: GalleryItem; index: number }) => (
    <figure
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#1c060f] group transition-all duration-500 hover:border-[#951C30]/50 hover:shadow-[0_0_0_1px_rgba(149,28,48,0.25),0_0_32px_rgba(149,28,48,0.10)] ${getGridClasses(item.type)}`}
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

export function VisualSection({ blocks }: { blocks: { id: string; label: string; items: string[] }[] }) {
  if (!blocks.length) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {blocks.map((block, bi) => (
        <div key={block.id} data-parallax className="flex min-h-32 flex-col justify-end border border-white/10 bg-white/[.03] p-6" style={{ marginTop: `${16 + bi * 10}px` }}>
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

export function TransformSection({ before, title, reducedMotion }: { before: { before: string; after: string }; title: string; reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const wipeTl = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || reducedMotion) return;
    const context = gsap.context(() => {
      gsap.set('[data-transform-wipe]', { clipPath: 'inset(0 100% 0 0)' });

      wipeTl.current = gsap.to('[data-transform-wipe]', {
        clipPath: 'inset(0 0% 0 0)',
        duration: 3.5,
        ease: 'power2.inOut',
        paused: true,
      });

      ScrollTrigger.create({
        trigger: root,
        start: 'top 68%',
        end: 'bottom top',
        toggleActions: 'play none none reverse',
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

        <span className="absolute bottom-3 left-3 z-20 rounded bg-black/55 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.22em] text-white/85 backdrop-blur transition-opacity group-hover:opacity-100 opacity-70">Before</span>
        <span className="absolute bottom-3 right-3 z-20 rounded bg-black/55 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.22em] text-white/85 backdrop-blur transition-opacity group-hover:opacity-100 opacity-70">After</span>

        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-full bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
            Click to Replay
          </span>
        </div>
      </div>
    </div>
  );
}

export function DeliverablesSection({ services }: { services: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {services.map((service, index) => (
        <div
          key={service}
          data-parallax
          className="flex min-h-28 items-center gap-5 border border-white/10 bg-white/[.03] p-6 transition-colors hover:border-[var(--accent)]/25 hover:bg-white/[.05]"
          style={{ marginTop: `${(index % 2 === 0 ? 0 : 22)}px` }}
        >
          <span className="text-[10px] font-bold text-[var(--accent)]">0{index + 1}</span>
          <span className="text-lg font-medium tracking-[-.03em] text-white/90 sm:text-xl">{service}</span>
        </div>
      ))}
    </div>
  );
}

export function ToolsSection({ tools }: { tools: string[] }) {
  return (
    <div className="flex max-w-4xl flex-wrap gap-4">
      {tools.map((tool, i) => (
        <span
          key={tool}
          data-parallax
          className="rounded-xl border border-white/20 bg-white/[.06] px-6 py-3.5 text-lg sm:text-xl font-medium tracking-wide text-white/95"
          style={{ marginTop: `${(i % 2 === 0 ? 0 : 18)}px` }}
        >
          {tool}
        </span>
      ))}
    </div>
  );
}

export function MetaSection({ project }: { project: Project }) {
  const fields: { label: string; value: string }[] = [];

  if (project.year) fields.push({ label: 'Year', value: String(project.year) });
  if (project.platform) fields.push({ label: 'Platform', value: project.platform });
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
