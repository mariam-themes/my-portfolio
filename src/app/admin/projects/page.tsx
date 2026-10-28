import { Metadata } from 'next';
import AdminProjectsClient from './AdminProjectsClient';
import CategoriesManager from '@/components/admin/CategoriesManager';

export const metadata: Metadata = {
  title: 'Projects | Admin Dashboard',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminProjectsPage() {
  return (
    <div className="space-y-8">
      {/* Categories Management */}
      <CategoriesManager />

      {/* Projects grid with tabs */}
      <AdminProjectsClient />
    </div>
  );
}
