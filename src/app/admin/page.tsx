import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Image as ImageIcon, FileText, MousePointerClick } from 'lucide-react';

export default async function AdminDashboard() {
  const t = await getTranslations('Admin.dashboard');

  const stats = [
    { label: t('totalProjects'), value: '24', icon: ImageIcon, trend: '+12%' },
    { label: t('blogArticles'), value: '18', icon: FileText, trend: '+4%' },
    { label: t('profileClicks'), value: '2,405', icon: MousePointerClick, trend: '+28%' },
  ];

  return (
    <div className="space-y-10">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group relative p-8 rounded-3xl bg-gradient-to-br from-[#3F0D1C] to-[#2A0813] border border-rose-900/30 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-rose-900/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/50 flex items-center justify-center border border-rose-800/50 group-hover:border-rose-500/50 transition-colors">
                <stat.icon size={24} className="text-rose-300 group-hover:text-rose-400" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                <ArrowUpRight size={14} />
                {stat.trend}
              </span>
            </div>
            
            <div>
              <p className="text-rose-300/80 text-sm font-semibold tracking-wider uppercase mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-white tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 p-8 rounded-3xl bg-gradient-to-br from-[#3F0D1C] to-[#2A0813] border border-rose-900/30 shadow-xl min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-600/20 blur-[80px] rounded-full pointer-events-none" />
           <p className="text-rose-400/50 font-medium tracking-widest uppercase relative z-10">{t('analyticsChart')}</p>
        </div>
        
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#3F0D1C] to-black/40 border border-rose-900/30 shadow-xl min-h-[400px]">
           <h3 className="text-lg font-bold text-white mb-6">{t('recentActivity')}</h3>
           <div className="space-y-6">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="flex gap-4 items-start">
                 <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                 <div>
                   <p className="text-sm text-rose-100 font-medium">{t('newProjectPublished')}</p>
                   <p className="text-xs text-rose-400/60 mt-0.5">{t('hoursAgo')}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

    </div>
  );
}
