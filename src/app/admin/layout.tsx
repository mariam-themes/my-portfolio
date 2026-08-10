import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

import DashboardEntry from '@/components/admin/DashboardEntry';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardEntry>
      <div className="flex h-screen bg-transparent overflow-hidden font-sans selection:bg-accent/30 relative">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-10 relative z-20">
            {children}
          </main>
        </div>
      </div>
    </DashboardEntry>
  );
}
