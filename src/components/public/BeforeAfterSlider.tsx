'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BeforeAfterProps {
  beforeUrl: string;
  afterUrl: string;
}

export default function BeforeAfterSlider({ beforeUrl, afterUrl }: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const beforeLabelRef = useRef<HTMLSpanElement>(null);
  const afterLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current || !afterRef.current || !dividerRef.current) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(afterRef.current, { clipPath: 'inset(0 0% 0 0)' });
      gsap.set(dividerRef.current, { left: '100%' });
      gsap.set(afterLabelRef.current, { autoAlpha: 1 });
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.1 });
      timeline
        .set(afterRef.current, { clipPath: 'inset(0 100% 0 0)' })
        .set(dividerRef.current, { left: '0%' })
        .set(afterLabelRef.current, { autoAlpha: 0 })
        .to(beforeLabelRef.current, { autoAlpha: 0.45, duration: 0.25 }, 0)
        .to(afterRef.current, { clipPath: 'inset(0 0% 0 0)', duration: 2.1, ease: 'power3.inOut' }, 0.35)
        .to(dividerRef.current, { left: '100%', duration: 2.1, ease: 'power3.inOut' }, 0.35)
        .to(afterLabelRef.current, { autoAlpha: 1, duration: 0.3 }, 1.9)
        .to(beforeLabelRef.current, { autoAlpha: 0.45, duration: 0.3 }, 1.9)
        .to({}, { duration: 1.6 })
        .to(afterRef.current, { clipPath: 'inset(0 100% 0 0)', duration: 1.5, ease: 'power2.inOut' })
        .to(dividerRef.current, { left: '0%', duration: 1.5, ease: 'power2.inOut' }, '<')
        .to(afterLabelRef.current, { autoAlpha: 0, duration: 0.25 }, '<0.25');

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 76%',
        end: 'bottom 24%',
        onEnter: () => timeline.play(),
        onEnterBack: () => timeline.play(),
        onLeave: () => timeline.pause(),
        onLeaveBack: () => timeline.pause(),
      });
    }, containerRef);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="before-after-reveal relative w-full aspect-video overflow-hidden border-y border-rose-100/15 bg-black"
      aria-label="Animated before and after comparison"
    >
      {/* Before Image (Background) */}
      <div className="absolute inset-0">
        <Image src={beforeUrl} alt="Before" fill className="object-cover" unoptimized />
      </div>

      {/* After Image (Foreground, clipped) */}
      <div
        ref={afterRef}
        className="absolute inset-0"
        style={{ clipPath: 'inset(0 100% 0 0)' }}
      >
        <Image src={afterUrl} alt="After" fill className="object-cover" unoptimized />
      </div>

      <div ref={dividerRef} className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-rose-100 shadow-[0_0_22px_rgba(255,205,219,0.85)]">
        <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-rose-100/80 bg-[#8f1739]/85 backdrop-blur-sm" />
      </div>

      <span ref={beforeLabelRef} className="absolute bottom-5 left-5 z-20 border-l border-rose-300 pl-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/90">Before</span>
      <span ref={afterLabelRef} className="absolute bottom-5 right-5 z-20 border-r border-rose-300 pr-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/90 opacity-0">After</span>
    </div>
  );
}
