import { getTranslations } from 'next-intl/server';
import { getGlobalSettings } from '@/lib/globalSettings';
import ContactForm from '@/components/public/ContactForm';
import { ArrowUpRight } from 'lucide-react';
import SocialIcon from '@/components/public/SocialIcon';
import ContactSectionClient from '@/components/public/ContactSectionClient';

export default async function ContactSection() {
  const t = await getTranslations('ContactSection');
  const settings = await getGlobalSettings();

  const socials = (settings?.socials || []).filter(
    (s) => s && s.url && s.url.trim().length > 0
  );
  const otherSocials = socials;

  const whatsappNumber = (settings?.whatsapp || '').trim();
  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}`
    : '';

  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 rtl:-left-auto rtl:-right-32 h-[40rem] w-[40rem] rounded-full bg-[#951C30]/10 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 rtl:right-auto rtl:left-0 h-[30rem] w-[30rem] rounded-full bg-rose-900/8 blur-[120px]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-24 md:py-32 lg:px-12">

        {/* ── Top kicker line ── */}
        <ContactSectionClient>
          <div className="mb-20 flex items-center gap-5">
            <div className="h-px flex-1 max-w-[4rem] bg-gradient-to-r from-[#951C30]/80 to-[#951C30]/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] rtl:tracking-normal text-[#951C30]">
              {t('kicker')}
            </span>
          </div>
        </ContactSectionClient>

        <div className="grid gap-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16 xl:gap-24 items-start">

          {/* ── Left: Headline + contacts ── */}
          <ContactSectionClient side="left">
            <div className="space-y-12 lg:sticky lg:top-32">
              {/* Headline */}
              <div className="space-y-5">
                <h2 className="font-serif text-[clamp(2.8rem,6vw,5.5rem)] font-normal leading-[1.05] text-white">
                  {t('title').split(' ').map((word, i, arr) => (
                    <span
                      key={i}
                      className={
                        i === arr.length - 1
                          ? 'italic text-[#951C30]'
                          : ''
                      }
                    >
                      {word}
                      {i < arr.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </h2>

                <p className="max-w-sm text-base leading-relaxed text-rose-100/55">
                  {t('subtitle')}
                </p>
              </div>

              {/* Contact links */}
              <div className="space-y-0 divide-y divide-rose-100/8">
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between py-5 text-rose-100/70 transition-colors duration-300 hover:text-white"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#951C30]/40 bg-[#951C30]/10 text-[#951C30] group-hover:bg-[#951C30]/20 transition-colors duration-300">
                        <SocialIcon platform="whatsapp" className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium tracking-wide rtl:tracking-normal">
                        {whatsappNumber}
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-rose-100/30 transition-all duration-300 group-hover:text-[#951C30] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                  </a>
                )}

                {settings?.email && (
                  <a
                    href={`mailto:${settings.email}`}
                    className="group flex items-center justify-between py-5 text-rose-100/70 transition-colors duration-300 hover:text-white"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#951C30]/40 bg-[#951C30]/10 text-[#951C30] group-hover:bg-[#951C30]/20 transition-colors duration-300">
                        <SocialIcon platform="email" className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium tracking-wide rtl:tracking-normal">
                        {settings.email}
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-rose-100/30 transition-all duration-300 group-hover:text-[#951C30] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                  </a>
                )}
              </div>

              {/* Socials */}
              {otherSocials.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {otherSocials.map((s) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label || s.platform}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-100/10 text-rose-100/40 transition-all duration-300 hover:border-[#951C30] hover:bg-[#951C30] hover:text-white"
                    >
                      <SocialIcon platform={s.platform} url={s.url} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </ContactSectionClient>

          {/* ── Right: Form ── */}
          <ContactSectionClient side="right">
            <div className="relative rounded-3xl border border-rose-100/8 bg-white/[0.02] p-8 sm:p-12 backdrop-blur-sm">
              {/* Corner accent */}
              <div
                aria-hidden
                className="absolute top-0 left-0 rtl:left-auto rtl:right-0 h-px w-24 bg-gradient-to-r from-[#951C30] to-transparent rtl:bg-gradient-to-l"
              />
              <div
                aria-hidden
                className="absolute top-0 left-0 rtl:left-auto rtl:right-0 w-px h-24 bg-gradient-to-b from-[#951C30] to-transparent"
              />

              <ContactForm />
            </div>
          </ContactSectionClient>
        </div>
      </div>
    </section>
  );
}
