import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Image as ImageIcon, FileText, Mail } from 'lucide-react';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { Blog } from '@/models/Blog';
import { Inquiry } from '@/models/Inquiry';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const t = await getTranslations('Admin.dashboard');
  const locale = await getLocale();
  const dateLocale = locale === 'ar' ? ar : enUS;

  await connectToDatabase();

  // Fetch real counts — blog count is total (not just published) so Live shows actual number
  const [projectCount, blogCount, inquiryCount] = await Promise.all([
    Project.countDocuments(),
    Blog.countDocuments({}),
    Inquiry.countDocuments({ status: 'new' }),
  ]);

  // Fetch recent activity (last 8 items across projects and blogs)
  const [recentProjects, recentBlogs, recentInquiries] = await Promise.all([
    Project.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title createdAt')
      .lean(),
    Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title createdAt')
      .lean(),
    Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name service createdAt')
      .lean(),
  ]);

  // Merge and sort by date
  type ActivityItem = {
    type: 'project' | 'blog' | 'inquiry';
    label: string;
    date: Date;
    href: string;
  };

  const activity: ActivityItem[] = [
    ...recentProjects.map((p: any) => ({
      type: 'project' as const,
      label: typeof p.title === 'object' ? (p.title.en || p.title.ar || 'Untitled') : (p.title || 'Untitled'),
      date: new Date(p.createdAt),
      href: '/admin/projects',
    })),
    ...recentBlogs.map((b: any) => ({
      type: 'blog' as const,
      label: b.title || 'Untitled',
      date: new Date(b.createdAt),
      href: '/admin/blogs',
    })),
    ...recentInquiries.map((i: any) => ({
      type: 'inquiry' as const,
      label: `${i.name} – ${i.service}`,
      date: new Date(i.createdAt),
      href: '/admin/inquiries',
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  const typeLabel: Record<ActivityItem['type'], string> = {
    project: locale === 'ar' ? 'مشروع جديد' : 'New project',
    blog: locale === 'ar' ? 'مقال منشور' : 'Blog published',
    inquiry: locale === 'ar' ? 'استفسار جديد' : 'New inquiry',
  };

  const typeColor: Record<ActivityItem['type'], string> = {
    project: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    blog: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]',
    inquiry: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  };

  const stats = [
    { label: t('totalProjects'), value: projectCount.toString(), icon: ImageIcon, color: 'text-rose-300' },
    { label: t('blogArticles'), value: blogCount.toString(), icon: FileText, color: 'text-purple-300' },
    { label: locale === 'ar' ? 'استفسارات جديدة' : 'New Inquiries', value: inquiryCount.toString(), icon: Mail, color: 'text-amber-300' },
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
                <stat.icon size={24} className={`${stat.color} group-hover:opacity-100`} />
              </div>
              {/* Live badge */}
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-900/40 px-2.5 py-1 rounded-full border border-rose-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                {locale === 'ar' ? 'مباشر' : 'Live'}
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

        {/* Quick Links */}
        <div className="col-span-2 p-8 rounded-3xl bg-gradient-to-br from-[#3F0D1C] to-[#2A0813] border border-rose-900/30 shadow-xl min-h-[400px] flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white">
            {locale === 'ar' ? 'روابط سريعة' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {[
              { label: locale === 'ar' ? 'إضافة مشروع جديد' : 'Add New Project', href: '/admin/projects/new', color: 'from-rose-900/40 to-rose-950/40 border-rose-800/40 hover:border-rose-500/60', icon: ImageIcon },
              { label: locale === 'ar' ? 'كتابة مقال جديد' : 'Write New Blog Post', href: '/admin/blogs/new', color: 'from-purple-900/40 to-purple-950/40 border-purple-800/40 hover:border-purple-500/60', icon: FileText },
              { label: locale === 'ar' ? 'عرض الاستفسارات' : 'View Inquiries', href: '/admin/inquiries', color: 'from-amber-900/40 to-amber-950/40 border-amber-800/40 hover:border-amber-500/60', icon: Mail },
              { label: locale === 'ar' ? 'إدارة الصفحة الرئيسية' : 'Manage Homepage', href: '/admin/sections', color: 'from-teal-900/40 to-teal-950/40 border-teal-800/40 hover:border-teal-500/60', icon: ArrowUpRight },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${item.color} border transition-all duration-300 group`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                  <item.icon size={20} className="text-white/70 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{item.label}</span>
                <ArrowUpRight size={16} className="ms-auto text-white/30 group-hover:text-white/70 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#3F0D1C] to-black/40 border border-rose-900/30 shadow-xl min-h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">{t('recentActivity')}</h3>
          {activity.length === 0 ? (
            <p className="text-rose-400/50 text-sm">{locale === 'ar' ? 'لا يوجد نشاط بعد.' : 'No activity yet.'}</p>
          ) : (
            <div className="space-y-5">
              {activity.map((item, i) => (
                <Link key={i} href={item.href} className="flex gap-4 items-start group">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${typeColor[item.type]}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-rose-100 font-medium truncate group-hover:text-white transition-colors">
                      <span className="text-rose-400/70 text-xs me-1">{typeLabel[item.type]}</span>
                      {item.label}
                    </p>
                    <p className="text-xs text-rose-400/60 mt-0.5">
                      {formatDistanceToNow(item.date, { addSuffix: true, locale: dateLocale })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
