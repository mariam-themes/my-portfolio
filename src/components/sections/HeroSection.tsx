'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

/**
 * Toggle between the reference site's silk photograph background
 * and a pure-CSS burgundy gradient fallback:
 *   HERO_BG_MODE = 'silk'      → uses /arcana-hero.jpg
 *   HERO_BG_MODE = 'gradient'  → uses a layered burgundy gradient (no image)
 */
const HERO_BG_MODE = 'gradient';

export default function HeroSection() {
  const t = useTranslations('Hero');

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      {/* Background */}
      {HERO_BG_MODE === 'silk' ? (
        <div className="absolute inset-0">
          <Image
            src="/arcana-hero.jpg"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#0a0507]/60" />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 88% 4%, rgba(125,15,46,0.5), transparent 28rem),' +
              'radial-gradient(circle at 8% 38%, rgba(81,8,29,0.4), transparent 32rem),' +
              'linear-gradient(180deg, #160509 0%, #0a0507 100%)',
          }}
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,5,7,0.65)_100%)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center sm:px-12 lg:px-16">
        <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70 sm:text-xs">
          {t('kicker')}
        </p>

        <h1 className="sr-only">
          {t('nameTop')} {t('nameBottom')}
        </h1>

        <div
          aria-hidden
          className="font-display text-[clamp(2.6rem,10.5vw,9rem)] font-black uppercase leading-[0.92] tracking-[-0.02em] text-[#f5f2f3]"
        >
          {t('nameTop')}
          <br />
          {t('nameBottom')}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-base font-light text-white/75 sm:text-lg">
          {t('subtitle')}
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-full bg-[#951C30] px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#ad2240]"
          >
            {t('ctaPrimary')}
          </Link>
          <Link
            href="/work"
            className="rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold tracking-wide text-white/90 transition-colors hover:border-[#d36a86]/70 hover:text-white"
          >
            {t('ctaSecondary')}
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-[11px] uppercase tracking-[0.3em] text-white/35">
          {t('scrollHint')}
        </span>
        <span className="block h-10 w-px bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
      </div>
    </section>
  );
}