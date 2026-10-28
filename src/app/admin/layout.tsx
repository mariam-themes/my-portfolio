import { NextIntlClientProvider } from 'next-intl';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import ParticlesBackground from '@/components/admin/ParticlesBackground';
import DashboardEntry from '@/components/admin/DashboardEntry';
import { Toaster } from 'react-hot-toast';
import HtmlLangDir from '@/components/HtmlLangDir';
import enMessages from '../../../messages/en.json';
import arMessages from '../../../messages/ar.json';
import { cookies } from 'next/headers';
import AdminSessionProvider from '@/components/admin/AdminSessionProvider';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Mariam's Dashboard",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminLang = cookieStore.get('admin_lang')?.value;
  const locale = adminLang === 'ar' ? 'ar' : 'en';
  const messages = locale === 'ar'
    ? { Admin: arMessages.Admin }
    : { Admin: enMessages.Admin };

  return (
    <AdminSessionProvider>
    <div className="min-h-full antialiased">
      <NextIntlClientProvider locale={locale} messages={messages}>
        <HtmlLangDir locale={locale} />
        <DashboardEntry>
          <Toaster position="top-right" toastOptions={{ className: 'bg-[#1A050C] text-rose-200 border border-rose-900/50 rounded-xl' }} />
          <div className={`flex h-screen bg-[#2A0813] overflow-hidden ${locale === 'ar' ? 'font-[family-name:var(--font-arabic-body)]' : 'font-sans'} selection:bg-rose-500/50 rounded-xl relative`}>
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
    </div>
    </AdminSessionProvider>
  );
}
