import Image from 'next/image';
import { useLayoutEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryItem } from '@/types/case-study';

gsap.registerPlugin(ScrollTrigger);

export function CSSKeyframes() {
  return (
    <style>{`
      @keyframes ken-burns {
        0%   { transform: scale(1)    translateZ(0); }
        100% { transform: scale(1.06) translateZ(0); }
      }
      .closing-ken-burns {
        animation: ken-burns 14s ease-in-out infinite alternate;
        will-change: transform;
      }
      .closing-ken-burns img,
      .closing-ken-burns video {
        width: 100%; height: 100%; object-fit: cover;
      }
      @keyframes cta-glow-pulse {
        0%, 100% { opacity: 0.5;  transform: translate(-50%, -50%) scale(1);    }
        50%       { opacity: 0.85; transform: translate(-50%, -50%) scale(1.12); }
      }
      .cta-glow-orb {
        animation: cta-glow-pulse 6s ease-in-out infinite;
        will-change: opacity, transform;
      }
      @keyframes burst-pulse {
        0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
        40%  { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.7; }
      }
      @keyframes cta-shimmer-sweep {
        0%   { transform: translateX(-130%) skewX(-15deg); }
        100% { transform: translateX(230%)  skewX(-15deg); }
      }
      .cta-primary-btn:hover .cta-shimmer {
        animation: cta-shimmer-sweep 0.7s ease forwards;
      }
      .cta-shimmer {
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255,255,255,0.18) 50%,
          transparent 100%
        );
        pointer-events: none;
      }
      @keyframes float-slow {
        0% { transform: translateY(0) translateX(0) scale(1); }
        33% { transform: translateY(-30px) translateX(20px) scale(1.05); }
        66% { transform: translateY(20px) translateX(-20px) scale(0.95); }
        100% { transform: translateY(0) translateX(0) scale(1); }
      }
      .animate-float-slow {
        animation: float-slow 15s ease-in-out infinite;
        will-change: transform;
      }
      .animate-float-delayed {
        animation: float-slow 18s ease-in-out infinite;
        animation-delay: -7s;
        will-change: transform;
      }
    `}</style>
  );
}

const VideoLightbox = dynamic(() => import('./VideoLightbox'), { ssr: false });

export function Media({ item, alt, priority = false }: { item?: Partial<GalleryItem>; alt: string; priority?: boolean }) {
  const [showLightbox, setShowLightbox] = useState(false);

  if (!item?.url) return <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,#6a1631,transparent_45%),#16040a]" />;
  const isVideoExt = /\.(mp4|webm|mov)(\?.*)?$/i.test(item.url);
  const isGifExt = /\.gif(\?.*)?$/i.test(item.url);
  
  // Whether to show the "GIF" overlay badge
  const showGifBadge = isGifExt || item.type === 'gif';

  // If it's a video file, it MUST be rendered with a <video> tag, even if labeled as 'gif'
  if (isVideoExt) {
    return (
      <>
        <div 
          className="relative h-full w-full cursor-pointer group/video" 
          onClick={(e) => {
            // Only open if not a generic click on the wipe slider
            e.stopPropagation();
            setShowLightbox(true);
          }}
        >
          <video src={item.url} autoPlay loop muted playsInline controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="h-full w-full object-cover" aria-label={alt} />
          {showGifBadge && (
            <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/20 pointer-events-none z-10">
              GIF
            </span>
          )}
          {/* Play Icon Overlay on Hover */}
          {!showGifBadge && (
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity bg-black/20 z-10 pointer-events-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-x-0.5">
                    <path d="M5 3L19 12L5 21V3Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
             </div>
          )}
        </div>
        {showLightbox && (
          <VideoLightbox
            src={item.url}
            alt={alt}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </>
    );
  }

  // Otherwise, it's an image (including actual .gif files)
  if (isGifExt || item.type === 'gif') {
    return (
      <div className="relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={alt} className="h-full w-full object-cover" loading={priority ? 'eager' : 'lazy'} />
        {showGifBadge && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/20 pointer-events-none z-10">
            GIF
          </span>
        )}
      </div>
    );
  }
  
  return <Image src={item.url} alt={alt} fill priority={priority} sizes="(min-width: 1024px) 50vw, 92vw" className="object-cover" />;
}

export function ImageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full select-none overflow-hidden bg-[#0b0107]" aria-hidden />
  );
}

export function SectionHeading({ num, label, sub }: { num: string; label: string; sub?: string }) {
  return (
    <div className="mb-12 max-w-3xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-4 rounded-full bg-black/20 px-5 py-2 backdrop-blur-sm border border-white/5 shadow-sm">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[.35em] text-[var(--accent)]" style={{ textShadow: '0 8px 24px rgba(149,28,48,0.5), 0 0 40px rgba(149,28,48,0.4)' }}>{num}</span>
          <span data-heading-line className="h-px w-8 origin-left bg-[var(--accent)]/50" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-[.35em] text-[var(--accent)]" style={{ textShadow: '0 8px 24px rgba(149,28,48,0.5), 0 0 40px rgba(149,28,48,0.4)' }}>{label}</span>
        </div>
      </div>
      {sub && (
        <p className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-[-.02em] text-white mt-4" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
