import "./globals.css";

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mariam Portfolio',
  description: 'Luxury Designer Portfolio for Mariam',
  icons: {
    icon: '/portfolio-logo-zoomed.png',
    shortcut: '/portfolio-logo-zoomed.png',
    apple: '/portfolio-logo-zoomed.png',
  },
};

// Root layout is intentionally minimal.
// Each route segment ([locale] and /admin) renders its own
// <html> and <body> so that lang/dir attributes are set correctly
// per locale without requiring a shared root html element.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
