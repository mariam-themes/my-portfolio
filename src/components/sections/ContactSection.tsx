import { useTranslations } from 'next-intl';
import ContactForm from '@/components/public/ContactForm';
import { ArrowUpRight } from 'lucide-react';

export default function ContactSection() {
  const t = useTranslations('ContactSection');

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
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
              <a
                href="#"
                className="group flex items-center justify-between text-rose-100/80 transition-colors hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#951C30]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </span>
                  <span className="font-medium tracking-wide">{t('whatsappLabel')}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-rose-100/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 rtl:-scale-x-100" />
              </a>

              <a
                href={`mailto:${t('emailLabel')}`}
                className="group flex items-center justify-between text-rose-100/80 transition-colors hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#951C30]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <span className="font-medium tracking-wide">{t('emailLabel')}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-rose-100/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 rtl:-scale-x-100" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold tracking-[0.2em] text-rose-100/40">
              <a href="#" className="transition-colors hover:text-rose-100">{t('instagram')}</a>
              <a href="#" className="transition-colors hover:text-rose-100">{t('behance')}</a>
              <a href="#" className="transition-colors hover:text-rose-100">{t('dribbble')}</a>
              <a href="#" className="transition-colors hover:text-rose-100">{t('linkedin')}</a>
            </div>
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
