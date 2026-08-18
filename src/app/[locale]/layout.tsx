import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getMessages } from 'next-intl/server';
import Navbar from '@/components/public/Navbar';

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Navbar />
      {children}
    </NextIntlClientProvider>
  );
}