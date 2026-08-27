import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getMessages } from 'next-intl/server';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import SmoothScroller from '@/components/public/SmoothScroller';
import { Inter, Playfair_Display, Alexandria, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Providers } from '@/components/Providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
});

const arabicHeadingFont = Alexandria({
  variable: '--font-arabic-heading',
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
});

const arabicBodyFont = IBM_Plex_Sans_Arabic({
  variable: '--font-arabic-body',
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
});



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
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${playfair.variable} ${arabicHeadingFont.variable} ${arabicBodyFont.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-[#0a0507]" suppressHydrationWarning>
        <Providers>
          <SmoothScroller>
            <NextIntlClientProvider messages={messages}>

              
              <Navbar />
              {children}
              <Footer />
            </NextIntlClientProvider>
          </SmoothScroller>
        </Providers>
      </body>
    </html>
  );
}