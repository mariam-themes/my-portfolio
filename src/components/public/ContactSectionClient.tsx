'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

export default function ContactSectionClient({
  children,
  side,
}: {
  children: React.ReactNode;
  side?: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      let xOffset = 0;
      let yOffset = 0;

      if (side === 'left') {
        xOffset = -32;
      } else if (side === 'right') {
        xOffset = 32;
      } else {
        yOffset = 28;
      }

      let mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(ref.current,
          { opacity: 0, x: xOffset, y: yOffset },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 90%',
              end: 'top 50%',
              scrub: 1,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div ref={ref}>
      {children}
    </div>
  );
}
