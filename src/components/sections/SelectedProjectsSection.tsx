'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

const IMAGES = [
  '/selected-projects/media_1787532825497.png',
  '/selected-projects/media_1787533243577.png',
  '/selected-projects/media_1787533436450.png',
  '/selected-projects/media_1787533688528.png',
  '/selected-projects/media_1787535553776.png',
  '/selected-projects/media_1787535553859.png',
  '/selected-projects/media_1787535553875.png',
  '/selected-projects/media_1787535553888.png',
  '/selected-projects/media_1787535553898.png',
  '/selected-projects/media_1787536921521.png',
  '/selected-projects/media_1787536929472.png',
];

export default function SelectedProjectsSection() {
  const t = useTranslations('SelectedProjects');

  // We duplicate the array to create a seamless infinite scrolling effect
  const marqueeImages = [...IMAGES, ...IMAGES];

  return (
    <div className="relative w-full bg-[#0a0507] py-24 md:py-32 overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 xl:px-32 mb-16">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] rtl:tracking-normal uppercase text-accent mb-4">
            <span className="w-12 h-[1px] bg-accent/50" />
            {t('kicker')}
            <span className="w-12 h-[1px] bg-accent/50" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">
            {t('title')} <span className="text-[#951C30] italic">{t('titleAccent')}</span>
          </h2>
          <p className="text-white/60 font-light leading-relaxed max-w-2xl">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Infinite Horizontal Scroll */}
      <div className="relative w-full flex overflow-hidden group">
        {/* Fading Edges */}
        <div className="absolute top-0 bottom-0 left-0 w-24 md:w-64 bg-gradient-to-r from-[#0a0507] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 md:w-64 bg-gradient-to-l from-[#0a0507] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-6 px-3 min-w-max animate-infinite-scroll group-hover:[animation-play-state:paused]">
          {marqueeImages.map((src, idx) => (
            <div 
              key={idx} 
              className="relative w-[280px] h-[350px] md:w-[350px] md:h-[450px] lg:w-[400px] lg:h-[500px] rounded-2xl overflow-hidden shrink-0 border border-white/10 group/card cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
            >
              <Image 
                src={src} 
                alt={`Selected Project ${idx + 1}`} 
                fill 
                className="object-cover transition-transform duration-700 group-hover/card:scale-110" 
                sizes="(max-width: 768px) 280px, (max-width: 1024px) 350px, 400px"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-[#951C30]/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
