import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#2A0813] overflow-hidden font-sans selection:bg-rose-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Luxury Background Glow */}
        <div className="absolute top-0 left-0 w-full h-96 bg-rose-600/10 blur-[120px] pointer-events-none" />
        <Header />
        <main className="flex-1 overflow-y-auto p-10 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
