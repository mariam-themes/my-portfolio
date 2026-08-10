import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Mariam Portfolio",
  description: "Luxury Designer Portfolio for Mariam",
  icons: {
    icon: "/portfolio-logo.jpeg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <div className="bg-blob-1 fixed -z-10 top-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="bg-blob-2 fixed -z-10 top-[40%] right-[10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
