'use client';

import { useTranslations, useLocale } from 'next-intl';
import { User, Search, Bell } from 'lucide-react';
import { setAdminLocaleCookie } from '@/lib/adminLocaleCookie';

export default function Header() {
  const t = useTranslations('Admin.shell');
  const locale = useLocale();

  const switchLocale = (next: 'en' | 'ar') => {
    if (next === locale) return;
    setAdminLocaleCookie(next);
    window.location.reload();
  };

  return (
    <header className="h-24 border-b border-card-border bg-card-bg backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-10">
      <div className="flex items-center gap-6">
<<<<<<< HEAD
        <h1 className="text-3xl font-light text-foreground tracking-wide font-serif">
          Welcome back, <span className="font-bold text-accent">Admin</span>
=======
        <h1 className="text-3xl font-light text-white tracking-wide">
          {t('welcomeBack')} <span className="font-bold">Mariam</span>
>>>>>>> main
        </h1>
      </div>

      <div className="flex items-center gap-8">
<<<<<<< HEAD
        <div className="hidden md:flex items-center gap-4 bg-background/50 border border-card-border rounded-full px-4 py-2.5 w-64 focus-within:ring-1 focus-within:ring-accent/50 transition-all">
          <Search size={18} className="text-accent" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder-foreground/50 w-full"
=======
        <div className="hidden md:flex items-center gap-4 bg-black/20 border border-white/5 rounded-full px-4 py-2.5 w-64 focus-within:ring-1 focus-within:ring-rose-500/50 transition-all">
          <Search size={18} className="text-rose-300" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="bg-transparent border-none outline-none text-sm text-rose-100 placeholder-rose-400/50 w-full"
>>>>>>> main
          />
        </div>

        <button className="relative text-accent hover:text-white transition-colors">
          <Bell size={22} />
<<<<<<< HEAD
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border border-background" />
=======
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#2A0813] rtl:-right-auto rtl:-left-1" />
>>>>>>> main
        </button>

        <div className="h-8 w-px bg-card-border" />

        {/* Language Switcher */}
        <div className="flex items-center gap-1 rounded-full bg-black/25 border border-rose-900/40 p-1">
          {(['en', 'ar'] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => switchLocale(code)}
              className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase transition-colors cursor-pointer ${
                locale === code
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-300 hover:text-white'
              }`}
            >
              {code === 'en' ? 'EN' : 'AR'}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-rose-900/50" />

        <div className="flex items-center gap-4 group cursor-pointer">
<<<<<<< HEAD
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">Menna Gad</p>
            <p className="text-xs text-foreground/60">Creative Director</p>
=======
          <div className="text-right rtl:text-left hidden md:block">
            <p className="text-sm font-bold text-white group-hover:text-rose-200 transition-colors">Mariam</p>
            <p className="text-xs text-rose-400">{t('creativeDirector')}</p>
>>>>>>> main
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent to-accent/40 p-0.5 shadow-lg shadow-accent/20">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center border-2 border-transparent">
              <User size={20} className="text-accent" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}