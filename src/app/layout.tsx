import "./globals.css";

import type { Metadata } from 'next';
import { Inter, El_Messiri, Playfair_Display } from 'next/font/google';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const playfair = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'] });
const arabicFont = El_Messiri({
  variable: '--font-arabic',
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Mariam Portfolio',
  description: 'Luxury Designer Portfolio for Mariam',
  icons: {
    icon: '/portfolio-logo-zoomed.png',
    shortcut: '/portfolio-logo-zoomed.png',
    apple: '/portfolio-logo-zoomed.png',
  },
};

// The ROOT layout is the only place that renders <html> and <body>.
// Every nested segment layout ([locale], /admin, /login, /blog,
// /testimonials, ...) is a wrapper that renders only its own providers/markup,
// so the document shell is defined exactly once.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} ${arabicFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        {/* Pre-paint gate: plain <script> is correct in App Router —
            next/script beforeInteractive is not supported in app/ directory. */}
        <script
          id="splash-prehidden-gate"
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(sessionStorage.getItem('m-portfolio-splash-seen')||/[?&]noSplash=1/.test(location.search)){document.documentElement.classList.add('splash-prehidden');}}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
