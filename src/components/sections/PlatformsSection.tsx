'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const PLATFORMS = [
  { id: 'zid',         name: 'Zid',         src: '/platforms/zid.png',         desc: { en: 'Saudi e-commerce platform for building modern online stores.',         ar: 'منصة زد السعودية لبناء متاجر إلكترونية احترافية.' } },
  { id: 'shopify',     name: 'Shopify',     src: '/platforms/shopify.png',     desc: { en: 'The global leader in e-commerce, powering millions of stores.',        ar: 'الرائد العالمي في التجارة الإلكترونية يدعم ملايين المتاجر.' } },
  { id: 'salla',       name: 'Salla',       src: '/platforms/salla.png',       desc: { en: 'Saudi-based platform trusted by thousands of local merchants.',        ar: 'منصة سلة الموثوقة من آلاف التجار المحليين.' } },
  { id: 'figma',       name: 'Figma',       src: '/platforms/figma.png',       desc: { en: 'Collaborative design tool for stunning UI and prototypes.',            ar: 'أداة التصميم التشاركي لبناء واجهات مستخدم رائعة.' } },
  { id: 'webflow',     name: 'Webflow',     src: '/platforms/webflow.png',     desc: { en: 'Visual web builder for fully custom, production-ready websites.',      ar: 'منشئ مواقع بصري لإنشاء مواقع مخصصة وجاهزة للإنتاج.' } },
  { id: 'wordpress',   name: 'WordPress',   src: '/platforms/wordpress.png',   desc: { en: "World's most popular CMS powering over 40% of the web.",               ar: 'نظام إدارة المحتوى الأكثر شعبية يشغّل أكثر من 40% من الإنترنت.' } },
  { id: 'woocommerce', name: 'WooCommerce', src: '/platforms/woocommerce.png', desc: { en: 'The most flexible open-source e-commerce plugin for WordPress.',       ar: 'إضافة التجارة الإلكترونية مفتوحة المصدر الأكثر مرونة لـ WordPress.' } },
];

const TRACK = [...PLATFORMS, ...PLATFORMS];

export default function PlatformsSection() {
  const t = useTranslations('PlatformsSection');
  const locale = useLocale();
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileContainerRef.current) return;
    
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(max-width: 767px)', () => {
        const cards = gsap.utils.toArray('.mobile-platform-card');
        cards.forEach((card: any) => {
          gsap.fromTo(card,
            { opacity: 0.65, scale: 0.96, y: 30 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'top 50%',
                scrub: true,
              }
            }
          );
        });
      });
    }, mobileContainerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[34rem] h-[34rem] rounded-full bg-[#951C30]/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full bg-[#951C30]/6 blur-[140px]" />
      </div>

      <div className="relative z-10">
        {/* Header — compact */}
        <div className="container mx-auto px-6 md:px-12 lg:px-20 mb-8 md:mb-12">
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
          <p className="mt-4 max-w-xl text-white/50 font-light leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* ── Infinite logo marquee — Desktop only ── */}
        <div className="relative overflow-hidden hidden md:block" dir="ltr">
          {/* Fade edges */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 z-10"
            style={{ background: 'linear-gradient(to right, #0a0507 0%, transparent 100%)' }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 z-10"
            style={{ background: 'linear-gradient(to left, #0a0507 0%, transparent 100%)' }}
          />

          <div className="platforms-scroll-track flex gap-6 w-max py-4" dir="ltr">
            {TRACK.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                title={p.name}
                className="group flex flex-shrink-0 flex-col items-center gap-3 px-6 sm:px-8 py-5 sm:py-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-[#951C30]/30 hover:bg-white/[0.04] hover:shadow-[0_8px_40px_rgba(149,28,48,0.15)]"
              >
                <Image
                  src={p.src}
                  alt={p.name}
                  width={240}
                  height={130}
                  className="object-contain h-24 sm:h-32 md:h-36 w-auto select-none relative z-10 transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <span className="text-xs sm:text-sm font-medium text-white/40 tracking-wide transition-colors duration-500 group-hover:text-white/70">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile Vertical Stack ── */}
        <div className="md:hidden flex flex-col gap-4 mt-8 px-6" ref={mobileContainerRef}>
          {PLATFORMS.map((p) => (
            <div
              key={`mob-${p.id}`}
              className="mobile-platform-card flex flex-col items-center gap-4 px-6 py-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.15)] will-change-transform"
            >
              <Image
                src={p.src}
                alt={p.name}
                width={240}
                height={130}
                className="object-contain h-24 w-auto select-none"
              />
              <span className="text-sm font-medium text-white/50 tracking-wide">
                {p.name}
              </span>
            </div>
          ))}
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
