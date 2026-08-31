import { getTranslations } from 'next-intl/server';
import { ChevronLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ContactForm from '@/components/public/ContactForm';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contact' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contact' });

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#2A0813] via-[#160308] to-[#0a0507] text-rose-50">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#951C30]/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-32 h-[24rem] w-[24rem] rounded-full bg-[#3F0D1C]/40 blur-[160px]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center px-6 pt-24 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-rose-100/60 transition hover:text-rose-50"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {locale === 'ar' ? 'العودة للمعرض' : 'Back to portfolio'}
        </Link>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-24">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E04A65]">
          {t('kicker')}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-xl text-rose-100/70">{t('subtitle')}</p>

        <div className="mt-10">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}