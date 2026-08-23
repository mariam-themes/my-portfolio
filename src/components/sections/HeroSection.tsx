'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

export default function HeroSection() {
  const t = useTranslations('Hero');
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mouse tracking values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowOpacity = useSpring(0, { damping: 30, stiffness: 200 });

  // Smooth the tracking slightly
  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  useGSAP(
    () => {
      // Parallax and depth effect for Hero content
      gsap.to(contentRef.current, {
        y: '30vh', // translate down visually as we scroll down (creates a slower parallax)
        scale: 0.85, // scale down to create depth
        opacity: 0, // fade out
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top', // when top of hero hits top of viewport
          end: 'bottom top', // when bottom of hero hits top of viewport
          scrub: true, // tie directly to scroll progress
        },
      });
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => glowOpacity.set(1)}
      onMouseLeave={() => glowOpacity.set(0)}
    >
      {/* Interactive Mouse Glow */}
      <motion.div
        className="pointer-events-none absolute z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d36a86] blur-[150px] mix-blend-screen"
        style={{
          left: smoothX,
          top: smoothY,
          opacity: glowOpacity,
        }}
      />

      {/* Content */}
      <div ref={contentRef} className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center sm:px-12 lg:px-16 transform-gpu">
        <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70 sm:text-xs">
          {t('kicker')}
        </p>

        <h1 className="sr-only">
          {t('nameTop')} {t('nameBottom')}
        </h1>

        <div
          aria-hidden
          className="font-serif text-[clamp(2.6rem,10.5vw,9rem)] font-medium uppercase leading-[0.92] tracking-[-0.02em] text-[#f5f2f3]"
        >
          {t('nameTop')}
          <br />
          {t('nameBottom')}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-base font-light text-white/75 sm:text-lg">
          {t('subtitle')}
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-full bg-[#951C30] px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#ad2240]"
          >
            {t('ctaPrimary')}
          </Link>
          <Link
            href="/work"
            className="rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold tracking-wide text-white/90 transition-colors hover:border-[#d36a86]/70 hover:text-white"
          >
            {t('ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}