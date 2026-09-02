'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
    const id = setTimeout(() => {
      lenis.resize();
      // Re-measure ScrollTrigger after Lenis recalculates its scroll limit
      ScrollTrigger.refresh();
    }, 150);
    return () => clearTimeout(id);
  }, [pathname, lenis]);

  return null;
}

function ScrollTriggerSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Keep ScrollTrigger in sync with Lenis's animated scroll position
    lenis.on('scroll', ScrollTrigger.update);

    // Refresh once Lenis has mounted so trigger positions match the smoothed scroller
    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, duration: 1.2 }}>
      <ScrollReset />
      <ScrollTriggerSync />
      <div style={{ overscrollBehavior: 'contain' }}>
        {children}
      </div>
    </ReactLenis>
  );
}