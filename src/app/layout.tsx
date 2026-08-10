import type { Metadata } from "next";
<<<<<<< HEAD
import "./globals.css";
import { Providers } from "@/components/Providers";

=======
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const arabicFont = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

>>>>>>> main
export const metadata: Metadata = {
  title: "Mariam Portfolio",
  description: "Luxury Designer Portfolio for Mariam",
  icons: {
    icon: "/portfolio-logo.jpeg"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-next-intl-locale") || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
<<<<<<< HEAD
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <div className="bg-blob-1 fixed -z-10 top-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="bg-blob-2 fixed -z-10 top-[40%] right-[10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
=======
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${arabicFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
>>>>>>> main
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}