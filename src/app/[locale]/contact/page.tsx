import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import ContactForm from '@/components/public/ContactForm';
import LocaleSwitcher from '@/components/LocaleSwitcher';

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
    <main className="min-h-screen bg-[#0a0507] text-rose-50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-widest text-rose-100/60 transition hover:text-rose-50"
        >
          ← {t('kicker')}
        </Link>
        <LocaleSwitcher />
      </header>

      <section className="mx-auto w-full max-w-3xl px-6 pb-24">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#951C30]">
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