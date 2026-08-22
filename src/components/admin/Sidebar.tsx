'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, Folder, FileText, Settings, Star, Inbox, LayoutDashboard, Briefcase, Image as ImageIcon } from 'lucide-react';

export default function Sidebar() {
  const t = useTranslations('Admin.shell');
  const pathname = usePathname();

  const links = [
    { name: t('dashboard'), href: '/admin', icon: Home },
    { name: t('sections'), href: '/admin/sections', icon: LayoutDashboard },
    { name: t('projects'), href: '/admin/projects', icon: Folder },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
    { name: t('blog'), href: '/admin/blogs', icon: FileText },
    { name: t('testimonials'), href: '/admin/testimonials', icon: Star },
    { name: t('inquiries'), href: '/admin/inquiries', icon: Inbox },
    { name: t('settings'), href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-72 h-screen bg-gradient-to-b from-[#3F0D1C] to-[#2A0813] border-r border-rose-900/30 rtl:border-r-0 rtl:border-l text-rose-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.4)] rtl:shadow-[-4px_0_24px_rgba(0,0,0,0.4)] relative z-20">
      <div className="p-8 flex items-center justify-center border-b border-rose-900/30">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-rose-800/50 shadow-xl shadow-rose-900/40 hover:scale-105 transition-transform duration-500">
          <Image 
            src="/portfolio-logo.jpeg" 
            alt="Mariam Logo" 
            fill
            className="object-cover"
          />
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto pb-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link 
              key={link.name} 
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                active
                  ? 'bg-gradient-to-r from-rose-600/80 to-rose-900/60 text-white shadow-lg shadow-rose-900/40'
                  : 'hover:bg-white/10 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${
                  active ? 'opacity-100' : ''
                }`}
              />
              <span
                className={`absolute ${
                  active ? 'opacity-100' : 'opacity-0'
                } top-1/2 -translate-y-1/2 ltr:left-0 rtl:right-0 w-1 h-6 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.8)] transition-opacity`}
              />
              <Icon size={22} className={`transition-colors relative z-10 ${active ? 'text-white' : 'text-rose-300 group-hover:text-white'}`} />
              <span className={`font-medium tracking-wide relative z-10 ${active ? 'text-white' : 'text-rose-100 group-hover:text-white'}`}>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6">
        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
          <p className="text-xs text-rose-300 uppercase tracking-widest font-semibold mb-1">{t('systemStatus')}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-sm text-rose-100">{t('allOperational')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
