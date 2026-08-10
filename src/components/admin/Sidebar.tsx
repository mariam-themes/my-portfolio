import Link from 'next/link';
import Image from 'next/image';
import { Home, Folder, FileText, Settings, Star } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Projects', href: '/admin/projects', icon: Folder },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'Add Blog', href: '/admin/blogs/new', icon: FileText },
    { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
    { name: 'Add Testimonial', href: '/admin/testimonials/new', icon: Star },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 h-screen glass-card rounded-none border-t-0 border-b-0 border-l-0 text-foreground flex flex-col relative z-20">
      <div className="p-8 flex items-center justify-center border-b border-card-border">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-accent/50 shadow-xl hover:scale-105 transition-transform duration-500">
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
              className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon size={22} className="text-accent group-hover:text-white transition-colors relative z-10" />
              <span className="font-medium tracking-wide text-foreground/80 group-hover:text-white relative z-10">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6">
        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
          <p className="text-xs text-accent uppercase tracking-widest font-semibold mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-sm text-foreground/90">All services operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
