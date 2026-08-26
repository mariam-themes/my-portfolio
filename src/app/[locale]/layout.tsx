import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getMessages } from 'next-intl/server';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Providers } from '@/components/Providers';
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
    <Providers>
      <NextIntlClientProvider messages={messages}>
        <HtmlLangDir />
        <div className="min-h-full flex flex-col" suppressHydrationWarning>
          {/* Global Animated Background Orbs */}
          <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#951C30] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.12] animate-blob" />
            <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#951C30] rounded-full mix-blend-screen filter blur-[130px] opacity-[0.08] animate-blob animation-delay-2000" />
          </div>

          <Navbar />
          {children}
          <Footer />
        </div>
      </NextIntlClientProvider>
    </Providers>
  );
}
