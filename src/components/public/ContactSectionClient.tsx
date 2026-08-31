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
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );

        // staggered children reveal (form fields, contact items)
        const el = ref.current;
        if (el) {
          const children = el.querySelectorAll('[data-reveal-child]');
          if (children.length) {
            gsap.fromTo(children,
              { opacity: 0, y: 18 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                stagger: 0.08,
                scrollTrigger: {
                  trigger: el,
                  start: 'top 82%',
                  toggleActions: 'play none none none',
                },
              }
            );
          }
        }
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
