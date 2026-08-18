'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Image from 'next/image';

const NAV_LINKS = [
  { key: 'home', target: '#hero' },
  { key: 'about', target: '#about' },
  { key: 'services', target: '#services' },
  { key: 'work', target: '#projectsPreview' },
  { key: 'blog', target: '#blog' },
  { key: 'contact', target: '#contact' },
];

export default function Navbar() {
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide the global Navbar on project details pages
  if (pathname.startsWith('/work/') || pathname.startsWith('/projects/')) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    const isHomepage = pathname === '/';
    
    if (isHomepage) {
      // Smooth scroll if on homepage
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to homepage with hash if not on homepage
      router.push(`/${target}`);
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-[#0a0507]/90 py-4 shadow-lg backdrop-blur-md'
            : 'bg-transparent py-6'
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
              <Image 
                src="/portfolio-logo.jpeg" 
                alt="Mariam Logo" 
                fill 
                className="object-cover" 
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-tight tracking-widest text-white">MARIAM</p>
              <p className="text-[10px] font-medium leading-tight tracking-widest text-rose-100/60">ALJUMAIAH</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.key}
                href={`/${link.target}`}
                onClick={(e) => handleNavClick(e, link.target)}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-100/70 transition-colors hover:text-white"
              >
                {t(link.key)}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#951C30] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b3223a]"
            >
              {t('startProject')}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a0507] pt-24 lg:hidden">
          <nav className="flex flex-col items-center gap-8 p-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.key}
                href={`/${link.target}`}
                onClick={(e) => handleNavClick(e, link.target)}
                className="text-sm font-bold uppercase tracking-[0.2em] text-rose-100/70 transition-colors hover:text-white"
              >
                {t(link.key)}
              </a>
            ))}
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#951C30] px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b3223a]"
            >
              {t('startProject')}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
