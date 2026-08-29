import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getGlobalSettings } from '@/lib/globalSettings';
import SocialIcon from '@/components/public/SocialIcon';
import FooterLocaleSwitcher from '@/components/public/FooterLocaleSwitcher';

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

  if (!settings) return null;

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
    <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-transparent">
      {/* Top gradient hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#951C30]/60 to-transparent" />
      {/* Ambient burgundy glow */}
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-[#951C30]/10 blur-3xl" />
      {/* Faint brand watermark — full width on all screens */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 w-full select-none text-center font-serif font-bold leading-none text-white/[0.025]"
        style={{ fontSize: '18vw' }}
      >
        {settings.siteName}
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-12 lg:py-16">
        {/* Brand + CTA — always first */}
        <div className="mb-8 sm:mb-10">
          <Link href="/" className="group inline-flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 transition-transform duration-500 group-hover:scale-105">
              <Image
                src={settings.logoUrl || '/portfolio-logo.jpeg'}
                alt={settings.siteName}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <span className="font-serif text-lg font-semibold tracking-wide text-white">
              {settings.siteName}
            </span>
          </Link>

          <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/45 sm:text-sm">
            {t('tagline')}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-[#951C30] hover:bg-[#951C30] hover:text-white sm:px-4 sm:py-2 sm:text-sm"
              >
                <SocialIcon platform="email" className="h-3.5 w-3.5" />
                {settings.email}
              </a>
            )}
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-[#951C30] px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#ad2240] sm:px-6 sm:py-3 sm:text-xs"
            >
              {t('startProject')}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* Links grid — 2-col on mobile, 3-col on desktop */}
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Navigate */}
          <div>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 sm:text-xs">
              {t('navigate')}
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    className="group inline-flex text-xs text-white/60 transition-colors hover:text-white sm:text-sm"
                  >
                    <span className="relative">
                      {tn(l.key)}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#951C30] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 sm:text-xs">
              {t('connect')}
            </h4>
            {socials.length > 0 || waLink ? (
              <div className="flex flex-wrap gap-2">
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#951C30] hover:bg-[#951C30] hover:text-white sm:h-10 sm:w-10"
                  >
                    <SocialIcon platform="whatsapp" className="h-4 w-4" />
                  </a>
                )}
                {socials.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label || s.platform}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#951C30] hover:bg-[#951C30] hover:text-white sm:h-10 sm:w-10"
                  >
                    <SocialIcon platform={s.platform} url={s.url} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/35">{t('noSocials')}</p>
            )}
          </div>

          {/* Useful Links */}
          {usefulLinks.length > 0 && (
            <div className="col-span-2 sm:col-span-1">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 sm:text-xs">
                {t('usefulLinks')}
              </h4>
              <ul className="space-y-2">
                {usefulLinks.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex text-xs text-white/60 transition-colors hover:text-white sm:text-sm"
                    >
                      <span className="relative">
                        {l.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#951C30] transition-all duration-300 group-hover:w-full" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-[10px] text-white/30 sm:text-xs md:flex-row">
          <p>{settings.copyright || `© ${new Date().getFullYear()} ${settings.siteName}`}</p>
          <FooterLocaleSwitcher />
          <p className="tracking-wide">{t('designedBy')}</p>
        </div>
      </div>
    </footer>
  );
}
