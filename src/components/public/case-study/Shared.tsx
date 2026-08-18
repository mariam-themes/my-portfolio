import Image from 'next/image';
import { GalleryItem } from '@/types/case-study';

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

export function Media({ item, alt, priority = false }: { item?: Partial<GalleryItem>; alt: string; priority?: boolean }) {
  if (!item?.url) return <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,#6a1631,transparent_45%),#16040a]" />;
  if (item.type === 'video') return <video src={item.url} autoPlay loop muted playsInline className="h-full w-full object-cover" aria-label={alt} />;
  if (item.type === 'gif') return <img src={item.url} alt={alt} className="h-full w-full object-cover" loading={priority ? 'eager' : 'lazy'} />;
  return <Image src={item.url} alt={alt} fill unoptimized priority={priority} sizes="(min-width: 1024px) 50vw, 92vw" className="object-cover" />;
}

export function ImageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full select-none overflow-hidden bg-[#0b0107]">
      <div className="absolute inset-0 h-full w-full">
        <Image
          src="/images/satin-bg.jpg"
          alt="Satin background"
          fill
          quality={100}
          className="object-cover opacity-70"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0107]/40 via-[#0b0107]/60 to-[#0b0107]/95" />
      
      {/* Continuous Ambient Background Motion (Performance Optimized without CSS blur) */}
      <div className="absolute top-[15%] left-[5%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(149,28,48,0.15)_0%,transparent_60%)] animate-float-slow" />
      <div className="absolute top-[60%] right-[5%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(149,28,48,0.12)_0%,transparent_60%)] animate-float-delayed" />
      <div className="absolute bottom-[10%] left-[25%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_60%)] animate-float-slow" style={{ animationDelay: '-12s' }} />
    </div>
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
