'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { resolveText, type LocalizedProject } from '@/lib/localizeProject';
import gsap from 'gsap';
import { useRouter } from '@/i18n/navigation';

type Props = {
  project: LocalizedProject;
  lastTriggerRef: React.RefObject<HTMLElement | null>;
  expandRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
};

export default function ProjectOverlay({ project, lastTriggerRef, expandRef, onClose }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigatedRef = useRef(false);
  const [fullProject, setFullProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const title = resolveText(project.title, project, 'title', locale);

  // Fetch full project data (independent of animation)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/projects/${project.slug}`);
        const json = await res.json();
        if (!cancelled && json.success) {
          setFullProject(json.data);
        }
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [project.slug]);

  // Animation — runs ONCE on mount, no data dependencies
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const expand = expandRef.current;
    const content = contentRef.current;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || !expand || !content || !overlay) {
      navigatedRef.current = true;
      router.push(`/work/${project.slug as string}`);
      return;
    }

    const card = lastTriggerRef.current?.closest('[data-project-card]') as HTMLElement | null;
    if (!card) {
      gsap.set(overlay, { autoAlpha: 1 });
      navigatedRef.current = true;
      router.push(`/work/${project.slug as string}`);
      return;
    }

    const r = card.getBoundingClientRect();

    // Create a wrapper div that will animate from card → viewport
    const frame = document.createElement('div');
    frame.setAttribute('aria-hidden', 'true');
    Object.assign(frame.style, {
      position: 'fixed',
      left: r.left + 'px',
      top: r.top + 'px',
      width: r.width + 'px',
      height: r.height + 'px',
      zIndex: '9999',
      borderRadius: '1rem',
      overflow: 'hidden',
      background: '#0a0507',
    });

    // Move the content div into the animating frame
    frame.appendChild(content);
    expand.appendChild(frame);
    expand.style.visibility = 'visible';
    gsap.set(overlay, { autoAlpha: 1 });
    card.style.opacity = '0';

    // Animate: card → full viewport
    const tl = gsap.timeline({
      onComplete() {
        // Animation done — navigate to the full project page
        card.style.opacity = '';
        navigatedRef.current = true;
        router.push(`/work/${project.slug as string}`);
      },
    });

    tl.to(frame, {
      left: 0,
      top: 0,
      width: '100vw',
      height: '100vh',
      borderRadius: '0px',
      duration: 0.6,
      ease: 'power3.inOut',
    }, 0);

    return () => {
      tl.kill();
      frame.remove();
      card.style.opacity = '';
      expand.style.visibility = 'hidden';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onPop = () => {
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        onClose();
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-[#0a0507] opacity-0"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        onClick={() => {
          navigatedRef.current = true;
          onClose();
        }}
        className="fixed top-5 start-5 z-[200] inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
      >
        <span className="rtl:hidden">←</span>
        <span>{locale === 'ar' ? 'رجوع' : 'Back'}</span>
        <span className="hidden rtl:inline-block">→</span>
      </button>

      {/* Content — starts here, moved into animated frame, then back */}
      <div ref={contentRef} className="w-full h-full bg-[#0a0507] overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full border-2 border-[#951C30]/30 border-t-[#951C30] animate-spin" />
          </div>
        ) : fullProject ? (
          <ProjectPage project={fullProject} locale={locale} />
        ) : (
          <div className="flex items-center justify-center h-full text-white/40">
            {locale === 'ar' ? 'لم يتم العثور على المشروع' : 'Project not found'}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectPage({ project, locale }: { project: any; locale: string }) {
  const title = project.title || '';
  const description = project.description || '';
  const heroUrl = project.heroMediaUrl || '';
  const gallery = project.gallery?.length ? project.gallery : heroUrl ? [{ url: heroUrl, type: 'desktop' }] : [];
  const services = project.services?.length ? project.services : [];
  const tools = project.tools?.length ? project.tools : [];
  const colors = project.visualDirection?.colors?.filter(Boolean) || [];
  const fonts = project.visualDirection?.fonts?.filter(Boolean) || [];
  const comparison = project.beforeAfter?.[0];

  return (
    <div className="min-h-screen bg-[#0a0507] text-white">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end pb-20">
        {heroUrl && (
          <div className="absolute inset-0">
            <img src={heroUrl} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0507] via-[#0a0507]/60 to-transparent" />
          </div>
        )}
        <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20">
          <p className="text-xs tracking-[0.3em] uppercase text-[#951C30] font-semibold mb-4">
            {project.sector || project.category || (locale === 'ar' ? 'دراسة حالة' : 'Case Study')}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-normal leading-[1.05]">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-base sm:text-lg font-light text-white/60 leading-relaxed">
              {description}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-4 text-xs font-mono tracking-widest text-white/40">
            {project.year && <span>{project.year}</span>}
            {project.platform && <span>• {project.platform}</span>}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 md:px-12 lg:px-20 space-y-8">
            {gallery.map((item: any, i: number) => (
              <div key={i} className="relative rounded-2xl overflow-hidden border border-white/5">
                <img src={item.url} alt={`${title} frame ${i + 1}`} className="w-full" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services + Tools */}
      {(services.length > 0 || tools.length > 0) && (
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="container mx-auto px-6 md:px-12 lg:px-20 grid sm:grid-cols-2 gap-12">
            {services.length > 0 && (
              <div>
                <h3 className="text-xs tracking-[0.3em] uppercase text-[#951C30] font-semibold mb-4">{locale === 'ar' ? 'الخدمات' : 'Services'}</h3>
                <div className="flex flex-wrap gap-2">
                  {services.map((s: string, i: number) => (
                    <span key={i} className="px-4 py-2 rounded-full border border-white/10 text-sm text-white/70">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {tools.length > 0 && (
              <div>
                <h3 className="text-xs tracking-[0.3em] uppercase text-[#951C30] font-semibold mb-4">{locale === 'ar' ? 'الأدوات' : 'Tools'}</h3>
                <div className="flex flex-wrap gap-2">
                  {tools.map((t: string, i: number) => (
                    <span key={i} className="px-4 py-2 rounded-full border border-white/10 text-sm text-white/70">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Visual Direction */}
      {(colors.length > 0 || fonts.length > 0) && (
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="container mx-auto px-6 md:px-12 lg:px-20">
            <h3 className="text-xs tracking-[0.3em] uppercase text-[#951C30] font-semibold mb-8">{locale === 'ar' ? 'التوجه البصري' : 'Visual Direction'}</h3>
            <div className="grid sm:grid-cols-2 gap-8">
              {colors.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 mb-3 uppercase tracking-widest">{locale === 'ar' ? 'الألوان' : 'Colors'}</p>
                  <div className="flex gap-3">
                    {colors.map((c: string, i: number) => (
                      <div key={i} className="w-12 h-12 rounded-lg border border-white/10" style={{ background: c }} title={c} />
                    ))}
                  </div>
                </div>
              )}
              {fonts.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 mb-3 uppercase tracking-widest">{locale === 'ar' ? 'الخطوط' : 'Fonts'}</p>
                  <div className="flex flex-wrap gap-2">
                    {fonts.map((f: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg border border-white/10 text-sm text-white/70">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Before / After */}
      {comparison && (
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="container mx-auto px-6 md:px-12 lg:px-20">
            <h3 className="text-xs tracking-[0.3em] uppercase text-[#951C30] font-semibold mb-8">{locale === 'ar' ? 'التحول' : 'Transformation'}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {comparison.before && (
                <div className="relative rounded-2xl overflow-hidden border border-white/5">
                  <img src={comparison.before} alt="Before" className="w-full" />
                  <span className="absolute top-4 start-4 text-xs font-mono tracking-widest text-white/60 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">{locale === 'ar' ? 'قبل' : 'Before'}</span>
                </div>
              )}
              {comparison.after && (
                <div className="relative rounded-2xl overflow-hidden border border-white/5">
                  <img src={comparison.after} alt="After" className="w-full" />
                  <span className="absolute top-4 start-4 text-xs font-mono tracking-widest text-white/60 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">{locale === 'ar' ? 'بعد' : 'After'}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
