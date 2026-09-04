'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  window.history.scrollRestoration = 'manual';
}

// Resets scroll position to the top on every client-side navigation.
function ScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    if (lenis) {
      // Immediately jump to top on navigation.
      lenis.scrollTo(0, { immediate: true, force: true });
    }
  }, [pathname, lenis]);

  return null;
}

// Wires the GSAP ticker to Lenis and keeps ScrollTrigger in sync.
function ScrollTriggerSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // Refresh once so trigger positions match the smoothed scroller.
    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(ticker);
    };
  }, [lenis]);

  return null;
}

// Observes document.body for height changes caused by ssr:false dynamic components
// mounting after Lenis has already booted, and re-syncs Lenis + ScrollTrigger.
function ContentSizeSync() {
  const lenis = useLenis();
  const rafRef = useRef<number>(0);
  const prevHeightRef = useRef<number>(0);

  useEffect(() => {
    if (!lenis) return;

    const scheduleResize = (entries: ResizeObserverEntry[]) => {
      // entries[0] is document.body; use its reported height.
      const newHeight = entries[0]?.contentRect.height ?? 0;
      // Guard: skip if the height hasn't meaningfully changed (prevents
      // a feedback loop if ScrollTrigger.refresh() adds/removes pin spacers).
      if (Math.abs(newHeight - prevHeightRef.current) < 1) return;
      prevHeightRef.current = newHeight;

      // Debounce via rAF so multiple rapid resize notifications in the same
      // frame collapse into a single lenis.resize() call.
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        ScrollTrigger.refresh();
        lenis.resize();
      });
    };

    const ro = new ResizeObserver(scheduleResize);
    ro.observe(document.body);

    // Force a final sync when all page resources (images, fonts) finish loading.
    const onWindowLoad = () => {
      ScrollTrigger.refresh();
      lenis.resize();
    };
    if (document.readyState === 'complete') {
      onWindowLoad();
    } else {
      window.addEventListener('load', onWindowLoad);
    }

    return () => {
      ro.disconnect();
      window.removeEventListener('load', onWindowLoad);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, duration: 1.2 }}>
      <ScrollReset />
      <ScrollTriggerSync />
      <ContentSizeSync />
      <div style={{ overscrollBehavior: 'contain' }}>
        {children}
      </div>
    </ReactLenis>
  );
}