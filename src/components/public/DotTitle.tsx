'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

type Dot = { x: number; y: number; gold: boolean };

const SAMPLE_X = 8.5;
const SAMPLE_Y = 7;
const ALPHA_THRESHOLD = 55;
const CANVAS_W = 1500;
const LINE_H = 170;

function rasterize(lines: [string, string]): Dot[] {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = LINE_H * 2 + 60;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  const fontStack = '"Playfair Display", "Georgia", serif';

  const fit = (text: string) => {
    const maxWidth = CANVAS_W - 140;
    let size = LINE_H;
    while (size > 40) {
      ctx.font = `700 ${size}px ${fontStack}`;
      const width = ctx.measureText(text).width;
      if (width <= maxWidth) return size;
      size -= 4;
    }
    return size;
  };

  const s1 = fit(lines[0]);
  const s2 = fit(lines[1] || lines[0]);

  ctx.font = `700 ${s1}px ${fontStack}`;
  ctx.fillText(lines[0], 70, LINE_H * 0.78 + 8);
  if (lines[1]) {
    ctx.font = `700 ${s2}px ${fontStack}`;
    ctx.fillText(lines[1], 70, LINE_H * 1.78 + 8);
  }

  const image = ctx.getImageData(0, 0, CANVAS_W, canvas.height);
  const { data } = image;
  const dots: Dot[] = [];

  for (let y = 0; y < canvas.height; y += SAMPLE_Y) {
    for (let x = 0; x < CANVAS_W; x += SAMPLE_X) {
      const alpha = data[(y * CANVAS_W + x) * 4 + 3];
      if (alpha > ALPHA_THRESHOLD) {
        dots.push({ x: x / CANVAS_W, y: y / canvas.height, gold: dots.length % 9 === 0 });
      }
    }
  }

  return dots;
}

export default function DotTitle({ title, reducedMotion }: { title: string; reducedMotion: boolean }) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState<Dot[] | null>(null);

  const lines = useMemo<[string, string]>(() => {
    const parts = title.trim().toUpperCase().split(/\s+/);
    return [parts[0] || 'PROJECT', parts.slice(1).join(' ') || ''];
  }, [title]);

  useEffect(() => {
    const hasIdle = 'requestIdleCallback' in window;
    const handle = hasIdle
      ? window.requestIdleCallback(() => setDots(rasterize(lines)), { timeout: 800 })
      : (window.setTimeout(() => setDots(rasterize(lines)), 0) as unknown);
    return () => {
      if (hasIdle && handle !== undefined) window.cancelIdleCallback(handle as unknown as number);
    };
  }, [lines]);

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    const dotEls = scope ? Array.from(scope.querySelectorAll<HTMLElement>('[data-dot]')) : [];
    if (!scope || !dotEls.length || reducedMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        dotEls,
        {
          x: () => gsap.utils.random(-220, 220) * 1.6,
          y: () => gsap.utils.random(-160, 160) * 1.6,
          autoAlpha: 0,
        },
        {
          x: 0,
          y: 0,
          autoAlpha: 0.5,
          duration: 1.4,
          stagger: { each: 0.002, from: 'random' },
          ease: 'expo.out',
        }
      );
    }, scope);
    return () => context.revert();
  }, [dots, reducedMotion]);

  const showDots = dots && dots.length > 0;

  return (
    <div ref={scopeRef} className="relative w-full max-w-5xl select-none">
      {/* Accessible heading always rendered — hidden when dot version is active */}
      <h1
        className={`text-[clamp(3rem,10vw,9rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em] text-white/95 ${showDots ? 'sr-only' : ''}`}
      >
        {title}
      </h1>

      {showDots && (
        <div
          className="cs-dot-title relative aspect-[1500/400] w-full"
          role="img"
          aria-label={title}
        >
          <div aria-hidden className="pointer-events-none absolute -inset-x-10 -inset-y-6 rounded-full bg-rose-500/8 blur-2xl" />
          {dots!.map((dot, i) => (
            <i
              key={i}
              data-dot
              aria-hidden="true"
              className="absolute rounded-full will-change-transform"
              style={{
                left: `${dot.x * 100}%`,
                top: `${dot.y * 100}%`,
                width: dot.gold ? 3.4 : 2.7,
                height: dot.gold ? 3.4 : 2.7,
                background: dot.gold ? 'rgba(205,171,122,0.85)' : 'rgba(242,205,212,0.8)',
                transform: 'translate(0px, 0px)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
