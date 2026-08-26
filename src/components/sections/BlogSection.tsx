'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function BlogSection() {
  const t = useTranslations('BlogPreview');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Floating preview refs
  const previewRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imgARef = useRef<HTMLImageElement>(null);
  const imgBRef = useRef<HTMLImageElement>(null);
  const topRef = useRef<'a' | 'b'>('a');
  const xToRef = useRef<((v: number) => void) | null>(null);
  const yToRef = useRef<((v: number) => void) | null>(null);
  const activeIndexRef = useRef<number | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs');
        const json = await res.json();
        if (json.success) setBlogs(json.data);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  // Init GSAP: quickTo for magnetic follow + initial preview state + scroll reveal
  useGSAP(
    () => {
      if (!previewRef.current || !innerRef.current) return;

      gsap.set(innerRef.current, { autoAlpha: 0, scale: 0.95 });
      xToRef.current = gsap.quickTo(previewRef.current, 'x', { duration: 0.6, ease: 'power3' });
      yToRef.current = gsap.quickTo(previewRef.current, 'y', { duration: 0.6, ease: 'power3' });

      // Default anchor: right-center of the viewport (kept subtle via mouse drift)
      const size = previewRef.current.offsetWidth || 300;
      xToRef.current(window.innerWidth - size - 40);
      yToRef.current(window.innerHeight / 2 - size / 2);

      // Restrained editorial reveal
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (headerRef.current) {
          gsap.fromTo(
            headerRef.current,
            { y: 30, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
            }
          );
        }
        if (listRef.current) {
          gsap.fromTo(
            listRef.current.querySelectorAll('.journal-row'),
            { y: 28, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: { trigger: listRef.current, start: 'top 85%' },
            }
          );
        }
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // Drive the floating preview from the hovered index
  useEffect(() => {
    if (hoveredIndex === null) {
      if (activeIndexRef.current !== null && innerRef.current) {
        gsap.to(innerRef.current, { autoAlpha: 0, scale: 0.95, duration: 0.4, ease: 'power2.out' });
        activeIndexRef.current = null;
      }
      return;
    }

    const blog = blogs[hoveredIndex];
    if (!blog) return;
    const img = blog.coverImage;

    if (!img) {
      if (innerRef.current) gsap.to(innerRef.current, { autoAlpha: 0, duration: 0.3 });
      activeIndexRef.current = hoveredIndex;
      return;
    }

    if (activeIndexRef.current === null) {
      const topNode = topRef.current === 'a' ? imgARef.current : imgBRef.current;
      const botNode = topRef.current === 'a' ? imgBRef.current : imgARef.current;
      if (topNode) topNode.src = img;
      gsap.set(topNode, { autoAlpha: 1 });
      gsap.set(botNode, { autoAlpha: 0 });
      gsap.fromTo(
        innerRef.current,
        { autoAlpha: 0, scale: 0.92, y: 12 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'expo.out' }
      );
    } else {
      const topNode = topRef.current === 'a' ? imgARef.current : imgBRef.current;
      const botNode = topRef.current === 'a' ? imgBRef.current : imgARef.current;
      if (botNode) botNode.src = img;
      gsap.to(topNode, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo(botNode, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo(innerRef.current, { scale: 0.97 }, { scale: 1, duration: 0.5, ease: 'expo.out' });
      topRef.current = topRef.current === 'a' ? 'b' : 'a';
    }
    activeIndexRef.current = hoveredIndex;
  }, [hoveredIndex, blogs]);

  const handleListMove = (e: React.MouseEvent) => {
    if (!xToRef.current || !yToRef.current || !listRef.current || !previewRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    const size = previewRef.current.offsetWidth || 300;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Anchor to the right edge of the list, drift subtly with the cursor
    let x = rect.right - size - 8 + (e.clientX - cx) * 0.12;
    let y = rect.top + rect.height / 2 - size / 2 + (e.clientY - cy) * 0.12;
    x = Math.max(8, Math.min(x, window.innerWidth - size - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - size - 8));
    xToRef.current(x);
    yToRef.current(y);
  };

  if (!loading && blogs.length === 0) {
    return (
      <section ref={sectionRef} className="py-24 md:py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div ref={headerRef} className="mb-14 md:mb-20">
            <span className="block text-[11px] tracking-[0.32em] uppercase text-white/40 mb-5">
              {t('kicker')}
            </span>
            <h2 className="font-serif font-normal text-4xl md:text-5xl lg:text-6xl text-foreground/90 tracking-[-0.01em] leading-[1.04]">
              {t('title')} <span className="italic" style={{ color: '#951C30' }}>{t('titleAccent')}</span>
            </h2>
          </div>
          <div className="text-center text-slate-500 py-12 border border-dashed rounded-xl">
            {t('noBlogs')}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-24 md:py-32 relative z-10">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div ref={headerRef} className="mb-14 md:mb-20">
          <span className="block text-[11px] tracking-[0.32em] uppercase text-white/40 mb-5">
            {t('kicker')}
          </span>
          <h2 className="font-serif font-normal text-4xl md:text-5xl lg:text-6xl text-foreground/90 tracking-[-0.01em] leading-[1.04]">
            {t('title')} <span className="italic" style={{ color: '#951C30' }}>{t('titleAccent')}</span>
          </h2>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 mt-6 text-[11px] font-medium tracking-[0.2em] uppercase text-white/45 hover:text-white transition-colors"
          >
            {t('readAll')}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Article list */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-pulse flex gap-2">
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        ) : (
          <div
            ref={listRef}
            className="divide-y divide-white/[0.06]"
            onMouseMove={handleListMove}
            onMouseLeave={() => setHoveredIndex(null)}
            onBlur={() => setHoveredIndex(null)}
          >
            {blogs.slice(0, 3).map((blog, index) => {
              const isActive = hoveredIndex === index;
              const formattedDate = blog.createdAt
                ? format(new Date(blog.createdAt), 'MMM yyyy').toUpperCase()
                : '';

              return (
                <Link
                  key={blog._id}
                  href={`/blog/${blog.slug}`}
                  className={`journal-row group flex items-center gap-4 md:gap-7 py-5 md:py-6 px-4 md:px-6 rounded-xl transition-colors duration-500 ${
                    isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]'
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onFocus={() => setHoveredIndex(index)}
                >
                  {/* Thumbnail */}
                  <span className="w-10 h-10 md:w-11 md:h-11 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 ring-1 ring-white/10">
                    {blog.coverImage ? (
                      <img
                        src={blog.coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest">
                        —
                      </span>
                    )}
                  </span>

                  {/* Title */}
                  <span className="flex-1 min-w-0">
                    <span className="block text-base md:text-lg font-serif font-normal text-foreground/80 leading-snug group-hover:text-white transition-colors duration-500 line-clamp-2">
                      {blog.title}
                    </span>
                  </span>

                  {/* Date */}
                  <span className="hidden sm:block flex-shrink-0 w-24 md:w-28 text-right text-[11px] uppercase tracking-[0.18em] text-white/35 font-mono">
                    {formattedDate}
                  </span>

                  {/* Circular arrow button */}
                  <span className="flex-shrink-0 grid place-items-center w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/15 text-white/55 transition-all duration-500 group-hover:scale-105 group-hover:border-white/40 group-hover:text-white">
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating preview (desktop only) */}
      <div
        ref={previewRef}
        className="pointer-events-none fixed top-0 left-0 z-50 hidden md:block"
        style={{ willChange: 'transform' }}
      >
        <div
          ref={innerRef}
          className="relative aspect-square w-[clamp(150px,15vw,210px)] rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/10"
        >
          <img ref={imgARef} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <img ref={imgBRef} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
