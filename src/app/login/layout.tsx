import { Inter, Playfair_Display, El_Messiri } from 'next/font/google';
import '../globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const playfair = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'] });
const arabicFont = El_Messiri({ variable: '--font-arabic', subsets: ['arabic'], weight: ['400', '500', '600', '700'] });

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${arabicFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
