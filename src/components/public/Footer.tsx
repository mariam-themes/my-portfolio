import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getGlobalSettings } from '@/lib/globalSettings';
import SocialIcon from '@/components/public/SocialIcon';
import FooterLocaleSwitcher from '@/components/public/FooterLocaleSwitcher';
import FooterClient from '@/components/public/FooterClient';
import { ArrowUpRight } from 'lucide-react';

const NAV_LINKS = [
  { key: 'home', href: '/' },
  { key: 'services', href: '/#services' },
  { key: 'work', href: '/work' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' },
];

export default async function Footer() {
  const t = await getTranslations('Footer');
  const tn = await getTranslations('Navbar');
  const settings = await getGlobalSettings();
  const locale = await getLocale();

  if (!settings) return null;

  const isAr = locale === 'ar';
  const siteName = isAr && settings.siteName.trim() === 'Mariam Aljumaiah' ? 'مريم الجميعة' : settings.siteName;
  const rawCopyright = settings.copyright || `© ${new Date().getFullYear()} ${settings.siteName}`;
  const copyright = isAr 
    ? rawCopyright.replace('Mariam Aljumaiah', 'مريم الجمعة').replace('All rights reserved.', 'جميع الحقوق محفوظة.')
    : rawCopyright;

  const socials = (settings.socials || []).filter(
    (s) => s && s.url && s.url.trim().length > 0
  );

  const usefulLinks = (settings.usefulLinks || []).filter(
    (l) => l && l.url && l.url.trim().length > 0
  );

  const whatsappNumber = (settings.whatsapp || '').trim();
  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}`
    : '';

  return (
    <FooterClient>
      {/* Top gradient hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#951C30]/60 to-transparent" />
      {/* Ambient burgundy glow */}
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-[#951C30]/10 blur-3xl" />
      
      {/* Faint brand watermark — behind everything */}
      <div
        aria-hidden
        className="footer-watermark pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full select-none text-center font-serif font-bold leading-none text-white/[0.02]"
        style={{ fontSize: '20vw', whiteSpace: 'nowrap' }}
      >
        {siteName}
      </div>

      <div className="relative container mx-auto px-6 md:px-12 lg:px-20 pt-16 md:pt-24 lg:pt-32 pb-5 md:pb-6 lg:pb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-24 mb-8 md:mb-10 lg:mb-12">
          
          {/* Left: Brand + CTA */}
          <div className="flex-1 space-y-10 footer-reveal">
            <Link href="/" className="group inline-flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/10 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={settings.logoUrl || '/portfolio-logo.jpeg'}
                  alt={siteName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <span className="font-serif text-2xl md:text-3xl font-semibold tracking-wide text-white">
                {siteName}
              </span>
            </Link>

            <p className="max-w-md text-sm md:text-base leading-relaxed text-white/50">
              {t('tagline')}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full bg-[#951C30] px-8 py-4 text-xs md:text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#b8223b] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(149,28,48,0.3)]"
              >
                {t('startProject')}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:-translate-y-1" />
              </Link>

              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.02] px-6 py-4 text-xs md:text-sm text-white/70 transition-colors hover:border-[#951C30] hover:bg-[#951C30]/10 hover:text-white"
                >
                  <SocialIcon platform="email" className="h-4 w-4" />
                  {settings.email}
                </a>
              )}
            </div>
          </div>

          {/* Right: Links Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-12 footer-reveal">
            
            {/* Navigate */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                {t('navigate')}
              </h4>
              <ul className="space-y-3">
                {NAV_LINKS.map((l) => (
                  <li key={l.key}>
                    <Link
                      href={l.href}
                      className="group inline-flex text-sm md:text-base text-white/60 transition-colors hover:text-white"
                    >
                      <span className="relative">
                        {tn(l.key)}
                        <span className="absolute -bottom-1 start-0 h-[2px] w-0 bg-[#951C30] transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                {t('connect')}
              </h4>
              {socials.length > 0 || waLink ? (
                <div className="flex flex-col gap-3">
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 text-sm md:text-base text-white/60 transition-colors hover:text-white"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] transition-colors group-hover:border-[#951C30] group-hover:bg-[#951C30]">
                        <SocialIcon platform="whatsapp" className="h-3.5 w-3.5" />
                      </span>
                      WhatsApp
                    </a>
                  )}
                  {socials.map((s) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 text-sm md:text-base text-white/60 transition-colors hover:text-white"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] transition-colors group-hover:border-[#951C30] group-hover:bg-[#951C30]">
                        <SocialIcon platform={s.platform} url={s.url} className="h-3.5 w-3.5" />
                      </span>
                      {s.label || s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40">{t('noSocials')}</p>
              )}
            </div>

            {/* Useful Links */}
            {usefulLinks.length > 0 && (
              <div className="col-span-2 sm:col-span-1 space-y-6">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                  {t('usefulLinks')}
                </h4>
                <ul className="space-y-3">
                  {usefulLinks.map((l, i) => (
                    <li key={i}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex text-sm md:text-base text-white/60 transition-colors hover:text-white"
                      >
                        <span className="relative">
                          {l.label}
                          <span className="absolute -bottom-1 start-0 h-[2px] w-0 bg-[#951C30] transition-all duration-300 group-hover:w-full" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 text-[11px] md:text-xs text-white/40 md:flex-row footer-reveal">
          <p>{copyright}</p>
          <FooterLocaleSwitcher />
          <p className="tracking-widest uppercase">{t('designedBy')}</p>
        </div>
      </div>
    </FooterClient>
  );
}
