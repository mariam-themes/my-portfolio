import { User, LogOut, Search, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-24 border-b border-rose-900/30 bg-[#2A0813]/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-light text-white tracking-wide">
          Welcome back, <span className="font-bold">Admin</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-4 bg-black/20 border border-white/5 rounded-full px-4 py-2.5 w-64 focus-within:ring-1 focus-within:ring-rose-500/50 transition-all">
          <Search size={18} className="text-rose-300" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-sm text-rose-100 placeholder-rose-400/50 w-full"
          />
        </div>

        <button className="relative text-rose-300 hover:text-white transition-colors">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#2A0813]" />
        </button>

        <div className="h-8 w-px bg-rose-900/50" />

        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-white group-hover:text-rose-200 transition-colors">Menna Gad</p>
            <p className="text-xs text-rose-400">Creative Director</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 p-0.5 shadow-lg shadow-rose-900/40">
            <div className="w-full h-full rounded-full bg-[#3F0D1C] flex items-center justify-center border-2 border-[#2A0813]">
              <User size={20} className="text-rose-200" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
