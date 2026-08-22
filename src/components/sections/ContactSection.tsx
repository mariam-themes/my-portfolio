import { getTranslations } from 'next-intl/server';
import { getGlobalSettings } from '@/lib/globalSettings';
import ContactForm from '@/components/public/ContactForm';
import { ArrowUpRight } from 'lucide-react';
import SocialIcon from '@/components/public/SocialIcon';

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
    <div className="mx-auto w-full max-w-7xl px-6 pt-24 md:pt-32">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-8">
        
        {/* Left Column: Info */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-[#951C30]" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#951C30]">
                {t('kicker')}
              </p>
            </div>
            
            <h2 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {t('title').split(' ').map((word, i, arr) => (
                <span key={i} className={i === arr.length - 1 ? "text-[#951C30]" : ""}>
                  {word}{" "}
                </span>
              ))}
            </h2>
            
            <p className="max-w-md text-base leading-relaxed text-rose-100/60">
              {t('subtitle')}
            </p>
          </div>

          <div className="mt-16 space-y-8">
            <div className="flex flex-col gap-6 border-b border-rose-900/30 pb-8">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between text-rose-100/80 transition-colors hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#951C30]">
                      <SocialIcon platform="whatsapp" className="h-5 w-5" />
                    </span>
                    <span className="font-medium tracking-wide">{whatsappNumber}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-rose-100/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 rtl:-scale-x-100" />
                </a>
              )}

              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="group flex items-center justify-between text-rose-100/80 transition-colors hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#951C30]">
                      <SocialIcon platform="email" className="h-5 w-5" />
                    </span>
                    <span className="font-medium tracking-wide">{settings.email}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-rose-100/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 rtl:-scale-x-100" />
                </a>
              )}
            </div>

            {otherSocials.length > 0 && (
              <div className="flex flex-wrap items-center gap-6 text-xs font-bold tracking-[0.2em] text-rose-100/40">
                {otherSocials.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-colors hover:text-rose-100"
                  >
                    <SocialIcon platform={s.platform} url={s.url} className="h-4 w-4" />
                    {s.label || s.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:pl-8 rtl:lg:pl-0 rtl:lg:pr-8">
          <ContactForm />
        </div>

      </div>
    </div>
  );
}
