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
    </div>
  );
}

export function SectionHeading({ num, label, sub }: { num: string; label: string; sub?: string }) {
  return (
    <div className="mb-12 max-w-3xl">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs sm:text-sm font-black uppercase tracking-[.35em] text-[var(--accent)] opacity-90">{num}</span>
        <span data-heading-line className="h-px flex-1 max-w-[40px] origin-left bg-[var(--accent)]/40" />
        <span className="text-xs sm:text-sm font-black uppercase tracking-[.35em] text-[var(--accent)] opacity-90">{label}</span>
      </div>
      {sub && (
        <p className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-[-.02em] text-white mt-4" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
