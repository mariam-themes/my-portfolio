'use client';

import { useTranslations, useLocale } from 'next-intl';

/*
  Optical Sizing Strategy — based on actual dimensions & visual content:
  ─────────────────────────────────────────────────────────────────────
  Problem: same `height` ≠ same visual mass.
    - Square logos (1:1) at h-14 → 56×56px  → area ≈ 3,136px²
    - Wide logos  (2:1) at h-14 → 56×112px  → area ≈ 6,272px² (2× bigger visually)

  Fix: fixed bounding BOX (both width+height) per category.
  Each logo renders with object-contain inside its box.
  Visual mass per logo ≈ equal regardless of original aspect ratio.

  Categories:
  ┌──────────────┬──────────┬──────────────┬────────────────────────────────┐
  │ Logo         │ Ratio    │ Type         │ Box (mobile → desktop)          │
  ├──────────────┼──────────┼──────────────┼────────────────────────────────┤
  │ Shopify      │ 0.88:1   │ Icon only    │ 48×48 → 64×64 (fill box, tall) │
  │ Webflow      │ 1.00:1   │ Icon only    │ 48×48 → 64×64                  │
  │ WordPress    │ 1.00:1   │ Icon only    │ 48×48 → 64×64                  │
  │ Zid          │ 1.00:1   │ Text + icon  │ 80×40 → 110×52                 │
  │ Salla        │ 1.00:1   │ Text + icon  │ 80×40 → 110×52                 │
  │ Figma        │ 2.00:1   │ Icon + text  │ 80×40 → 110×52                 │
  │ WooCommerce  │ 2.03:1   │ Wordmark     │ 90×44 → 120×56                 │
  └──────────────┴──────────┴──────────────┴────────────────────────────────┘
*/

const PLATFORMS = [
  {
    id: 'platform1', name: 'Shopify', src: '/platforms/platform1.png',
    // 0.88:1 ≈ square icon — square box
    boxClass: 'w-12 h-12 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]',
  },
  {
    id: 'platform2', name: 'Webflow', src: '/platforms/platform2.png',
    // 1:1 square icon — square box
    boxClass: 'w-12 h-12 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]',
  },
  {
    id: 'platform3', name: 'Zid', src: '/platforms/platform3.png',
    // 1:1 SQUARE — must use square box (was wrongly given 2:1 wide box → rendered at half-size!)
    boxClass: 'w-12 h-12 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]',
  },
  {
    id: 'platform4', name: 'WordPress', src: '/platforms/platform4.png',
    // 1:1 square icon — square box
    boxClass: 'w-12 h-12 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]',
  },
  {
    id: 'platform5', name: 'WooCommerce', src: '/platforms/platform5.png',
    // 2.03:1 wide wordmark — wide box, same height as square logos
    boxClass: 'w-24 h-12 md:w-32 md:h-16 lg:w-36 lg:h-[72px]',
  },
  {
    id: 'platform6', name: 'Figma', src: '/platforms/platform6.png',
    // 2:1 icon+text — wide box, same height as square logos
    boxClass: 'w-24 h-12 md:w-32 md:h-16 lg:w-36 lg:h-[72px]',
  },
  {
    id: 'platform7', name: 'Salla', src: '/platforms/platform7.png',
    // 1:1 SQUARE — must use square box (was wrongly given 2:1 wide box → rendered at half-size!)
    boxClass: 'w-12 h-12 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]',
  },
];

/*
  Burgundy filter chain → exact #951C30 from any transparent/dark PNG.
  Preserves alpha channel — only colors opaque pixels.
*/
const BURGUNDY_FILTER =
  'brightness(0) saturate(100%) invert(13%) sepia(88%) saturate(4000%) hue-rotate(330deg) brightness(75%)';

// Triplicate to guarantee track width > any viewport on any device
const TRACK = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS];

export default function PlatformsSection() {
  const t = useTranslations('PlatformsSection');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[34rem] h-[34rem] rounded-full bg-[#951C30]/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full bg-[#951C30]/6 blur-[140px]" />
      </div>

      <div className="relative z-10">
        {/* ── Section Header ── */}
        <div className="container mx-auto px-6 md:px-12 lg:px-20 mb-8 md:mb-10">
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-[#951C30] font-semibold mb-4 rtl:tracking-normal w-fit">
            <span className="w-12 h-[1px] bg-[#951C30]/50" />
            {t('kicker')}
            <span className="w-12 h-[1px] bg-[#951C30]/50" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white leading-tight">
            {t('title')}{' '}
            <span className="italic" style={{ color: '#951C30' }}>
              {t('titleAccent')}
            </span>
          </h2>
          <p className="mt-3 max-w-xl text-white/50 font-light leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* ── Seamless Infinite Logo Marquee ── */}
        {/*
          Horizontal marquee on ALL screen sizes (no mobile grid fallback).
          Two identical tracks ensure pixel-perfect seamless loop:
            track-1 slides out → track-2 is already in its place → loop.
          Direction: LTR slides left (translateX -100%), RTL slides right (+100%).
          Logo shapes are never flipped — only movement direction changes.
        */}
        <div className="relative overflow-hidden w-full flex items-center" dir="ltr">
          {/* Edge fades — logos gracefully enter/exit viewport */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-36 z-10"
            style={{ background: 'linear-gradient(to right, #0a0507 50%, transparent 100%)' }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-36 z-10"
            style={{ background: 'linear-gradient(to left, #0a0507 50%, transparent 100%)' }}
          />

          {[0, 1].map((trackIdx) => (
            <div
              key={trackIdx}
              aria-hidden={trackIdx === 1 ? 'true' : 'false'}
              className={`flex flex-shrink-0 items-center py-5 md:py-8 ${
                isRtl ? 'animate-marquee-rtl' : 'animate-marquee-ltr'
              }`}
            >
              {TRACK.map((p, i) => (
                <div
                  key={`t${trackIdx}-${p.id}-${i}`}
                  title={p.name}
                  // Symmetric px padding → gap at loop boundary === gap between logos inside track
                  className="flex-shrink-0 flex items-center justify-center px-5 md:px-8 group"
                >
                  {/*
                    Optical normalization bounding box per logo.
                    Fixed w+h defined per logo based on its aspect ratio and visual content.
                    img object-contain ensures no crop/distort/stretch.
                    The box clips visual overflow uniformly → equal optical footprint.
                  */}
                  <div className={`relative flex items-center justify-center ${p.boxClass}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.src}
                      alt={p.name}
                      className="w-full h-full object-contain select-none
                                 opacity-70
                                 transition-all duration-300 ease-out
                                 group-hover:opacity-100 group-hover:scale-105"
                      style={{ filter: BURGUNDY_FILTER }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* LTR — track slides left by its own full width */
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }

        /* RTL — track slides right (requires dir="ltr" on parent to maintain layout, then slides from left) */
        @keyframes marquee-rtl {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }

        .animate-marquee-ltr {
          animation: marquee-ltr 40s linear infinite;
          will-change: transform;
        }

        .animate-marquee-rtl {
          animation: marquee-rtl 40s linear infinite;
          will-change: transform;
        }

        /* Respect user's motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-ltr,
          .animate-marquee-rtl {
            animation-play-state: paused;
          }
        }
      `}</style>
    </section>
  );
}
