'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection() {
  const t = useTranslations('Hero');
  const locale = useLocale();
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowOpacity = useSpring(0, { damping: 30, stiffness: 200 });
  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  useGSAP(
    () => {
      // Scroll-out parallax
      gsap.to(contentRef.current, {
        y: '25vh',
        scale: 0.88,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Entrance animation for each line
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from('.hero-kicker',  { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' })
        .from('.hero-name-line', { y: 60, opacity: 0, duration: 1, stagger: 0.12, ease: 'power4.out' }, '-=0.4')
        .from('.hero-subtitle',  { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .from('.hero-ctas',      { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
        .from('.hero-scroll',    { y: 10, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-transparent"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => glowOpacity.set(1)}
      onMouseLeave={() => glowOpacity.set(0)}
    >
      {/* Mouse-follow glow — light behind cursor */}
      <motion.div
        className="pointer-events-none absolute h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d36a86]/35 blur-[180px] mix-blend-screen"
        style={{ left: smoothX, top: smoothY, opacity: glowOpacity, zIndex: 4 }}
      />

      {/* ── Main Content ── */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-20 transform-gpu pt-28 sm:pt-32"
      >
        {/* Kicker line */}
        <div className="hero-kicker mb-8 flex items-center gap-5 justify-center">
          <span className="block h-px w-12 bg-[#951C30]/70" />
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.4em] rtl:tracking-normal text-white/55">
            {t('kicker')}
          </p>
          <span className="block h-px w-12 bg-[#951C30]/70" />
        </div>

        {/* Hidden a11y h1 */}
        <h1 className="sr-only">{t('nameTop')} {t('nameBottom')}</h1>

        {/* Giant display name */}
        <div
          aria-hidden
          className="text-center select-none"
        >
          <div className={`hero-name-line font-serif tracking-[-0.03em] ${locale === 'ar' ? 'text-[clamp(3.5rem,13vw,11rem)] font-bold leading-[0.85]' : 'text-[clamp(3.2rem,12vw,10.5rem)] font-semibold leading-[0.88]'} text-[#f5f2f3]`}>
            {t('nameTop')}
          </div>
          <div className={`hero-name-line font-serif tracking-[-0.03em] ${locale === 'ar' ? 'text-[clamp(3.5rem,13vw,11rem)] font-bold leading-[0.85]' : 'text-[clamp(3.2rem,12vw,10.5rem)] font-semibold leading-[0.88]'}`}>
            {/* Second line gets the accent */}
            <span
              className="italic"
              style={{
                WebkitTextStroke: '1px rgba(149,28,48,0.8)',
                color: 'transparent',
                background: 'linear-gradient(135deg, #951C30 0%, #e05a7a 60%, #951C30 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('nameBottom')}
            </span>
          </div>
        </div>

        {/* Subtitle */}
        <p className="hero-subtitle mx-auto mt-8 max-w-xl text-center text-base sm:text-lg font-light leading-relaxed text-white/60">
          {t('subtitle')}
        </p>

        {/* CTAs */}
        <div className="hero-ctas mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#951C30] px-8 py-4 text-[13px] font-bold uppercase tracking-[0.18em] rtl:tracking-normal text-white shadow-[0_0_40px_rgba(149,28,48,0.4)] transition-all duration-300 hover:bg-[#b8223b] hover:shadow-[0_0_60px_rgba(149,28,48,0.6)] hover:-translate-y-0.5"
          >
            {t('ctaPrimary')}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-8 py-4 text-[13px] font-bold uppercase tracking-[0.18em] rtl:tracking-normal text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/[0.08] hover:text-white hover:-translate-y-0.5"
          >
            {t('ctaSecondary')}
          </Link>
        </div>

        {/* Scroll cue */}
        <div className="hero-scroll mt-16 flex justify-center">
          <motion.div
            className="flex flex-col items-center gap-2 cursor-default"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          >
            <span className="text-[9px] uppercase tracking-[0.35em] text-white/25">Scroll</span>
            <div className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}