'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

function ScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) {
      window.scrollTo(0, 0);
      return;
    }
    // Immediately jump to top on navigation
    lenis.scrollTo(0, { immediate: true, force: true });
    // Recalculate page height after content renders (important for dynamic pages)
    const id = setTimeout(() => lenis.resize(), 150);
    return () => clearTimeout(id);
  }, [pathname, lenis]);

  useEffect(() => {
    if (!lenis) return;
    
    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    
    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(ticker);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, duration: 1.2 }}>
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}
