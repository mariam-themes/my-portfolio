'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Image from 'next/image';

const NAV_LINKS = [
  { key: 'home',         target: '#hero' },
  { key: 'work',         target: '#projectsPreview' },
  { key: 'about',       target: '#about' },
  { key: 'services',    target: '#services' },
  { key: 'blog',        target: '#blog' },
  { key: 'contact',     target: '#contact' },
];

export default function Navbar() {
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let lastState = false;
    const handleScroll = () => {
      const newState = window.scrollY > 50;
      if (newState !== lastState) {
        lastState = newState;
        setIsScrolled(newState);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide the global Navbar on project details pages
  if (pathname.startsWith('/work/') || pathname.startsWith('/projects/')) {
    return null;
  }

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
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center justify-self-start gap-3 transition-opacity hover:opacity-80"
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
              <p className="text-sm md:text-base font-bold leading-tight tracking-widest text-white">{t('nameTop')}</p>
              <p className="text-xs md:text-sm font-medium leading-tight tracking-widest text-rose-100/60">{t('nameBottom')}</p>
            </div>
          </Link>

          {/* Desktop Nav — centered at the viewport so it aligns with the hero text */}
          <nav className="hidden lg:flex items-center justify-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.key}
                href={`/${link.target}`}
                onClick={(e) => handleNavClick(e, link.target)}
                className="group relative whitespace-nowrap text-[11px] rtl:text-[15px] font-bold uppercase tracking-[0.2em] rtl:tracking-normal text-rose-100/70 transition-colors hover:text-white"
              >
                {t(link.key)}
                <span className="absolute -bottom-1.5 left-0 rtl:left-auto rtl:right-0 h-[2px] w-0 bg-[#951C30] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-self-end gap-4">
            <LocaleSwitcher />
            
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#951C30] px-6 py-2.5 text-xs rtl:text-[15px] font-bold uppercase tracking-widest rtl:tracking-normal text-white transition-colors hover:bg-[#b3223a]"
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
                className="text-sm rtl:text-lg font-bold uppercase tracking-[0.2em] rtl:tracking-normal text-rose-100/70 transition-colors hover:text-white"
              >
                {t(link.key)}
              </a>
            ))}
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#951C30] px-8 py-3 text-sm rtl:text-[15px] font-bold uppercase tracking-widest rtl:tracking-normal text-white transition-colors hover:bg-[#b3223a]"
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
