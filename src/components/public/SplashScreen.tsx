'use client';

import { useEffect, useState, useRef } from 'react';
import { useLocale } from 'next-intl';

const SPLASH_KEY = 'm-portfolio-splash-seen';
const DRAW_MS = 1200;
const HOLD_MS = 400;
const FADE_MS = 400;
const TOTAL_MS = DRAW_MS + HOLD_MS + FADE_MS;

export default function SplashScreen() {
  const locale = useLocale();
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<{ hold: ReturnType<typeof setTimeout>; fade: ReturnType<typeof setTimeout> } | null>(null);

  useEffect(() => {
    try {
      if (window.location.search.includes('noSplash=1')) return;
      if (sessionStorage.getItem(SPLASH_KEY)) return;
    } catch {}

    setShow(true);

    timerRef.current = {
      hold: setTimeout(() => setFading(true), DRAW_MS + HOLD_MS),
      fade: setTimeout(() => {
        setShow(false);
        try { sessionStorage.setItem(SPLASH_KEY, '1'); } catch {}
      }, TOTAL_MS),
    };

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current.hold);
        clearTimeout(timerRef.current.fade);
      }
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity ${fading ? 'opacity-0 duration-400' : 'opacity-100 duration-0'}`}
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, #3a0c18 0%, #1a0610 35%, #0a0507 70%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[20%] w-[30rem] h-[30rem] rounded-full bg-[#951C30]/15 blur-[160px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[24rem] h-[24rem] rounded-full bg-[#951C30]/10 blur-[140px]" />
      </div>

      <div className="relative z-10 px-12 py-8 sm:px-16 sm:py-10">
        <div
          className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#951C30] to-transparent origin-left"
          style={{ width: '100%', transform: 'scaleX(0)', animation: `splash-draw-h ${DRAW_MS}ms ease-out forwards` }}
        />
        <div
          className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#951C30] to-transparent origin-right"
          style={{ width: '100%', transform: 'scaleX(0)', animation: `splash-draw-h ${DRAW_MS}ms ease-out ${DRAW_MS * 0.5}ms forwards` }}
        />
        <div
          className="absolute top-0 left-0 w-[1px] bg-gradient-to-b from-[#951C30] via-[#951C30] to-transparent origin-top"
          style={{ height: '100%', transform: 'scaleY(0)', animation: `splash-draw-v ${DRAW_MS * 0.6}ms ease-out ${DRAW_MS * 0.2}ms forwards` }}
        />
        <div
          className="absolute top-0 right-0 w-[1px] bg-gradient-to-b from-[#951C30] via-[#951C30] to-transparent origin-bottom"
          style={{ height: '100%', transform: 'scaleY(0)', animation: `splash-draw-v ${DRAW_MS * 0.6}ms ease-out ${DRAW_MS * 0.7}ms forwards` }}
        />

        <div className="absolute top-[-2px] left-[-2px] w-1 h-1 rounded-full bg-[#951C30] splash-dot" style={{ animationDelay: `${DRAW_MS * 0.2}ms` }} />
        <div className="absolute top-[-2px] right-[-2px] w-1 h-1 rounded-full bg-[#951C30] splash-dot" style={{ animationDelay: `${DRAW_MS * 0.7}ms` }} />
        <div className="absolute bottom-[-2px] left-[-2px] w-1 h-1 rounded-full bg-[#951C30] splash-dot" style={{ animationDelay: `${DRAW_MS * 0.9}ms` }} />
        <div className="absolute bottom-[-2px] right-[-2px] w-1 h-1 rounded-full bg-[#951C30] splash-dot" style={{ animationDelay: `${DRAW_MS * 1.1}ms` }} />

        <div className="flex flex-col items-center gap-3">
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-wide">
            <span className="text-[#951C30]">
              {locale === 'ar' ? 'مريم' : "Mariam's"}
            </span>
            <span className="text-white ml-3">
              {locale === 'ar' ? 'بورتفوليو' : 'Portfolio'}
            </span>
          </h1>
        </div>
      </div>

      <style>{`
        @keyframes splash-draw-h {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes splash-draw-v {
          0% { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
        @keyframes splash-dot {
          0% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        .splash-dot {
          opacity: 0;
          animation: splash-dot 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
