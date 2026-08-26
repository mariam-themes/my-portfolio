import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Providers } from '@/components/Providers';

// Blog is a standalone (non-localized) section, so we pin the request locale to
// the default and provide it to next-intl for the Navbar/Footer translations.
export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  setRequestLocale('en');
  const messages = await getMessages();

  return (
    <Providers>
      <NextIntlClientProvider locale="en" messages={messages}>
        <div className="min-h-full flex flex-col">
          <Navbar />
          {children}
          <Footer />
        </div>
      </NextIntlClientProvider>
    </Providers>
  );
}
