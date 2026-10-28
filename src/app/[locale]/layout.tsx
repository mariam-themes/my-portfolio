import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getMessages } from 'next-intl/server';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import SmoothScroller from '@/components/public/SmoothScroller';
import HtmlLangDir from '@/components/HtmlLangDir';

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
    <div className="min-h-screen flex flex-col bg-[#0a0507]">
      <SmoothScroller>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <HtmlLangDir locale={locale} />
          <Navbar />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </SmoothScroller>
    </div>
  );
}

