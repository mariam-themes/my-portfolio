import Link from 'next/link';
import Image from 'next/image';
import { Home, Folder, FileText, Settings, Star } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Projects', href: '/admin/projects', icon: Folder },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 h-screen bg-gradient-to-b from-[#3F0D1C] to-[#2A0813] border-r border-rose-900/30 text-rose-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.4)] relative z-20">
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
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/10 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon size={22} className="text-rose-300 group-hover:text-white transition-colors relative z-10" />
              <span className="font-medium tracking-wide text-rose-100 group-hover:text-white relative z-10">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6">
        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
          <p className="text-xs text-rose-300 uppercase tracking-widest font-semibold mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-sm text-rose-100">All services operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
