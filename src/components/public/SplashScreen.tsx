'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

const SPLASH_KEY = 'm-portfolio-splash-seen';
const BORDER_DURATION = 1200;
const HOLD_DURATION = 400;
const FADE_DURATION = 400;

export default function SplashScreen() {
  const locale = useLocale();
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<'draw' | 'hold' | 'fade' | 'done'>('draw');

  useEffect(() => {
    if (window.location.search.includes('noSplash=1')) return;
    try {
      if (sessionStorage.getItem(SPLASH_KEY)) return;
    } catch {}

    setShow(true);

    const holdTimer = setTimeout(() => setPhase('hold'), BORDER_DURATION);
    const fadeTimer = setTimeout(() => setPhase('fade'), BORDER_DURATION + HOLD_DURATION);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      try { sessionStorage.setItem(SPLASH_KEY, '1'); } catch {}
    }, BORDER_DURATION + HOLD_DURATION + FADE_DURATION);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (!show || phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-400 ease-in-out ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, #3a0c18 0%, #1a0610 35%, #0a0507 70%)',
      }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[20%] w-[30rem] h-[30rem] rounded-full bg-[#951C30]/15 blur-[160px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[24rem] h-[24rem] rounded-full bg-[#951C30]/10 blur-[140px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] rounded-full bg-[#951C30]/8 blur-[120px]" />
      </div>

      {/* Border frame that draws around the text */}
      <div className="relative z-10 px-12 py-8 sm:px-16 sm:py-10">
        {/* Top border */}
        <div
          className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#951C30] to-transparent origin-left"
          style={{
            width: '100%',
            transform: 'scaleX(0)',
            animation: `splash-draw-h ${BORDER_DURATION}ms ease-out forwards`,
          }}
        />
        {/* Bottom border */}
        <div
          className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#951C30] to-transparent origin-right"
          style={{
            width: '100%',
            transform: 'scaleX(0)',
            animation: `splash-draw-h ${BORDER_DURATION}ms ease-out ${BORDER_DURATION * 0.5}ms forwards`,
          }}
        />
        {/* Left border */}
        <div
          className="absolute top-0 left-0 w-[1px] bg-gradient-to-b from-[#951C30] via-[#951C30] to-transparent origin-top"
          style={{
            height: '100%',
            transform: 'scaleY(0)',
            animation: `splash-draw-v ${BORDER_DURATION * 0.6}ms ease-out ${BORDER_DURATION * 0.2}ms forwards`,
          }}
        />
        {/* Right border */}
        <div
          className="absolute top-0 right-0 w-[1px] bg-gradient-to-b from-[#951C30] via-[#951C30] to-transparent origin-bottom"
          style={{
            height: '100%',
            transform: 'scaleY(0)',
            animation: `splash-draw-v ${BORDER_DURATION * 0.6}ms ease-out ${BORDER_DURATION * 0.7}ms forwards`,
          }}
        />

        {/* Corner dots */}
        <div className="absolute top-[-2px] left-[-2px] w-1 h-1 rounded-full bg-[#951C30] splash-dot" style={{ animationDelay: `${BORDER_DURATION * 0.2}ms` }} />
        <div className="absolute top-[-2px] right-[-2px] w-1 h-1 rounded-full bg-[#951C30] splash-dot" style={{ animationDelay: `${BORDER_DURATION * 0.7}ms` }} />
        <div className="absolute bottom-[-2px] left-[-2px] w-1 h-1 rounded-full bg-[#951C30] splash-dot" style={{ animationDelay: `${BORDER_DURATION * 0.9}ms` }} />
        <div className="absolute bottom-[-2px] right-[-2px] w-1 h-1 rounded-full bg-[#951C30] splash-dot" style={{ animationDelay: `${BORDER_DURATION * 1.1}ms` }} />

        {/* Text content */}
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
