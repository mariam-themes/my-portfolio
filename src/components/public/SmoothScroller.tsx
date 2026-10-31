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

// Wires the GSAP ticker to Lenis exclusively.
// ReactLenis is created with autoRaf:false so only GSAP drives the tick,
// preventing the double-compute that caused scroll jank.
function ScrollTriggerSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(ticker);
    // Keep lagSmoothing at default (500ms, 33ms) for GSAP's built-in jank handling.
    // Setting it to 0 disabled compensation and made big frame spikes cause huge jumps.

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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | 0>(0);
  const prevHeightRef = useRef<number>(0);

  useEffect(() => {
    if (!lenis) return;

    const scheduleResize = (entries: ResizeObserverEntry[]) => {
      const newHeight = entries[0]?.contentRect.height ?? 0;
      // Use a larger threshold (5px) to avoid unnecessary reflows from minor
      // height changes (e.g. GSAP pin spacers being added/removed).
      if (Math.abs(newHeight - prevHeightRef.current) < 5) return;
      prevHeightRef.current = newHeight;

      // Trailing debounce: accordion/image height tweens fire ResizeObserver
      // every frame; refreshing Lenis/ScrollTrigger mid-tween causes mobile shake.
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = 0;
        ScrollTrigger.refresh();
        lenis.resize();
      }, 160);
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = 0;
      }
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  return (
    // autoRaf: false — GSAP ticker drives lenis exclusively (ScrollTriggerSync).
    // If ReactLenis also runs its own RAF loop we get double-compute per frame.
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, duration: 1.2, autoRaf: false }}>
      <ScrollReset />
      <ScrollTriggerSync />
      <ContentSizeSync />
      <div style={{ overscrollBehavior: 'contain' }}>
        {children}
      </div>
    </ReactLenis>
  );
}