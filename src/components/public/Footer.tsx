import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getGlobalSettings } from '@/lib/globalSettings';
import SocialIcon from '@/components/public/SocialIcon';

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
      {/* Faint brand watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 w-full -translate-x-1/2 select-none text-center font-serif font-bold leading-none text-white/[0.025] text-[18vw]"
      >
        {settings.siteName}
      </div>

      <div className="container relative mx-auto px-6 lg:px-12 py-20 md:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-6">
            <Link href="/" className="group flex w-fit items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={settings.logoUrl || '/portfolio-logo.jpeg'}
                  alt={settings.siteName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="font-serif text-xl font-semibold tracking-wide text-white">
                {settings.siteName}
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/50">
              {t('tagline')}
            </p>

            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-white/70 transition-colors hover:border-[#951C30] hover:bg-[#951C30] hover:text-white"
              >
                <SocialIcon platform="email" className="h-4 w-4" />
                {settings.email}
              </a>
            )}

            <Link
              href="/contact"
              className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#951C30] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#ad2240]"
            >
              {t('startProject')}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Navigate */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              {t('navigate')}
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    className="group inline-flex text-sm text-white/70 transition-colors hover:text-white"
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
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              {t('connect')}
            </h4>
            {socials.length > 0 || waLink ? (
              <div className="flex flex-wrap gap-3">
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#951C30] hover:bg-[#951C30] hover:text-white"
                  >
                    <SocialIcon platform="whatsapp" className="h-[18px] w-[18px]" />
                  </a>
                )}
                {socials.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label || s.platform}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#951C30] hover:bg-[#951C30] hover:text-white"
                  >
                    <SocialIcon platform={s.platform} url={s.url} className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
              ) : (
              <p className="text-sm text-white/40">{t('noSocials')}</p>
            )}
          </div>

          {/* Useful Links */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              {t('usefulLinks')}
            </h4>
            {usefulLinks.length > 0 && (
              <ul className="space-y-3">
                {usefulLinks.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex text-sm text-white/70 transition-colors hover:text-white"
                    >
                      <span className="relative">
                        {l.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#951C30] transition-all duration-300 group-hover:w-full" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row">
          <p>{settings.copyright || `© ${new Date().getFullYear()} ${settings.siteName}`}</p>
          <p className="tracking-wide">{t('designedBy')}</p>
        </div>
      </div>
    </footer>
  );
}
