'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function ScrollMotionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Refresh ScrollTrigger when layout changes
      ScrollTrigger.refresh();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {children}
    </div>
  );
}
