import { User, LogOut, Search, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-24 border-b border-card-border bg-card-bg backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-light text-foreground tracking-wide font-serif">
          Welcome back, <span className="font-bold text-accent">Admin</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-4 bg-background/50 border border-card-border rounded-full px-4 py-2.5 w-64 focus-within:ring-1 focus-within:ring-accent/50 transition-all">
          <Search size={18} className="text-accent" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder-foreground/50 w-full"
          />
        </div>

        <button className="relative text-accent hover:text-white transition-colors">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border border-background" />
        </button>

        <div className="h-8 w-px bg-card-border" />

        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">Menna Gad</p>
            <p className="text-xs text-foreground/60">Creative Director</p>
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
