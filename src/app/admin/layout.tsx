import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import ParticlesBackground from '@/components/admin/ParticlesBackground';
import DashboardEntry from '@/components/admin/DashboardEntry';
import { Toaster } from 'react-hot-toast';
import HtmlLangDir from '@/components/HtmlLangDir';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLangDir locale={locale} />
      <DashboardEntry>
        <Toaster
          position="top-right"
          toastOptions={{ className: 'bg-[#1A050C] text-rose-200 border border-rose-900/50 rounded-xl' }}
        />
        <div className="flex h-screen bg-[#2A0813] overflow-hidden font-sans selection:bg-rose-500/30 relative">
          <ParticlesBackground />

          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden relative z-10">
            {/* Luxury Background Glow */}
            <div className="absolute top-0 left-0 w-full h-96 bg-rose-600/10 blur-[120px] pointer-events-none" />
            <Header />
            <main className="flex-1 overflow-y-auto p-10 relative z-20">{children}</main>
          </div>
        </div>
      </DashboardEntry>
    </NextIntlClientProvider>
  );
}
