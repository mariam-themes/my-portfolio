'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

const PLATFORMS = [
  { id: 'zid',         name: 'Zid',         src: '/platforms/zid.png',         desc: { en: 'Saudi e-commerce platform for building modern online stores.',         ar: 'منصة زد السعودية لبناء متاجر إلكترونية احترافية.' } },
  { id: 'shopify',     name: 'Shopify',     src: '/platforms/shopify.png',     desc: { en: 'The global leader in e-commerce, powering millions of stores.',        ar: 'الرائد العالمي في التجارة الإلكترونية يدعم ملايين المتاجر.' } },
  { id: 'salla',       name: 'Salla',       src: '/platforms/salla.png',       desc: { en: 'Saudi-based platform trusted by thousands of local merchants.',        ar: 'منصة سلة الموثوقة من آلاف التجار المحليين.' } },
  { id: 'figma',       name: 'Figma',       src: '/platforms/figma.png',       desc: { en: 'Collaborative design tool for stunning UI and prototypes.',            ar: 'أداة التصميم التشاركي لبناء واجهات مستخدم رائعة.' } },
  { id: 'webflow',     name: 'Webflow',     src: '/platforms/webflow.png',     desc: { en: 'Visual web builder for fully custom, production-ready websites.',      ar: 'منشئ مواقع بصري لإنشاء مواقع مخصصة وجاهزة للإنتاج.' } },
  { id: 'wordpress',   name: 'WordPress',   src: '/platforms/wordpress.png',   desc: { en: "World's most popular CMS powering over 40% of the web.",               ar: 'نظام إدارة المحتوى الأكثر شعبية يشغّل أكثر من 40% من الإنترنت.' } },
  { id: 'woocommerce', name: 'WooCommerce', src: '/platforms/woocommerce.png', desc: { en: 'The most flexible open-source e-commerce plugin for WordPress.',       ar: 'إضافة التجارة الإلكترونية مفتوحة المصدر الأكثر مرونة لـ WordPress.' } },
];

// Duplicate for seamless infinite loop
const TRACK = [...PLATFORMS, ...PLATFORMS];

const VALUES = [
  { key: 'premium', Icon: Sparkles },
  { key: 'convert', Icon: TrendingUp },
  { key: 'craft', Icon: ShieldCheck },
] as const;

export default function PlatformsSection() {
  const t = useTranslations('PlatformsSection');
  const locale = useLocale();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[34rem] h-[34rem] rounded-full bg-[#951C30]/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full bg-[#951C30]/6 blur-[140px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-6 md:px-12 lg:px-20 mb-14">
          <div className="flex items-center gap-4 mb-5">
            <span className="w-10 h-[1px] bg-[#951C30]/60" />
            <span className="text-xs tracking-[0.3em] rtl:tracking-normal uppercase text-[#951C30] font-semibold">
              {t('kicker')}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-normal text-white leading-tight">
            {t('title')}{' '}
            <span className="italic" style={{ color: '#951C30' }}>
              {t('titleAccent')}
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-white/50 font-light leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Concept statement */}
        <div className="container mx-auto px-6 md:px-12 lg:px-20 mb-16">
          <p className="max-w-4xl text-2xl md:text-4xl font-serif leading-[1.25] text-white/90">
            {locale === 'ar' ? (
              <>
                الإبداع الراقي ليس صدفة — بل يُـ{' '}
                <span className="italic text-[#951C30]">يُهندَس</span>{' '}
                على منصّات تثق بها أفضل العلامات التجارية، لتبدو كل تجربة فاخرة وتعمل بلا عيب.
              </>
            ) : (
              <>
                Great work isn&apos;t accidental. It&apos;s{' '}
                <span className="italic text-[#951C30]">engineered</span>{' '}
                on the platforms the world&apos;s best brands trust — so every project looks premium and performs flawlessly.
              </>
            )}
          </p>
        </div>

        {/* Value pillars — why the work matters */}
        <div className="container mx-auto px-6 md:px-12 lg:px-20 mb-20">
          <div className="grid sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            {VALUES.map(({ key, Icon }) => (
              <div
                key={key}
                className="bg-[#0a0507] p-8 flex flex-col gap-4 transition-colors duration-500 hover:bg-[#951C30]/[0.06]"
              >
                <Icon className="h-7 w-7 text-[#951C30]" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-white">
                  {t(`values.${key}.title`)}
                </h3>
                <p className="text-sm text-white/45 font-light leading-relaxed">
                  {t(`values.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Infinite logo marquee — full bleed, always ltr so Arabic/English behave same ── */}
        <div className="relative overflow-hidden" dir="ltr">
          {/* Fade edges */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-28 z-10"
            style={{ background: 'linear-gradient(to right, #0a0507 0%, transparent 100%)' }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-28 z-10"
            style={{ background: 'linear-gradient(to left, #0a0507 0%, transparent 100%)' }}
          />

          <div className="platforms-scroll-track flex gap-6 w-max py-2" dir="ltr">
            {TRACK.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                title={locale === 'ar' ? p.desc.ar : p.desc.en}
                className="group flex flex-shrink-0 w-72 h-44 rounded-2xl border border-white/[0.08] bg-white/[0.04] flex flex-col items-center justify-center gap-3 transition-all duration-500 hover:border-[#951C30]/50 hover:bg-[#951C30]/[0.06] hover:shadow-[0_0_40px_rgba(149,28,48,0.25)]"
              >
                <div className="relative flex items-center justify-center h-24">
                  <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-[#951C30]/0 blur-2xl transition-all duration-500 group-hover:bg-[#951C30]/20" />
                  <Image
                    src={p.src}
                    alt={p.name}
                    width={170}
                    height={90}
                    className="object-contain max-h-[84px] w-auto select-none relative z-10 transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/60 transition-colors duration-500 group-hover:text-white/90">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes platforms-infinite-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .platforms-scroll-track {
          animation: platforms-infinite-scroll 28s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .platforms-scroll-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
