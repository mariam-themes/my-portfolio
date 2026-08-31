'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

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

  return null;
}

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  return (
<<<<<<< HEAD
    <ReactLenis root options={{ lerp: 0.12, duration: 1.1, smoothWheel: true }}>
      <ScrollReset />
      {children}
=======
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, duration: 1.2 }}>
      <ScrollToTop />
      <div style={{ overscrollBehavior: 'contain' }}>
        {children}
      </div>
>>>>>>> main
    </ReactLenis>
  );
}
