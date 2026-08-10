import ProjectForm from '@/components/admin/ProjectForm';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Add New Project | Admin Dashboard',
};

export default async function AddProjectPage() {
  const t = await getTranslations('Admin.projectAdd');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/projects" className="inline-flex items-center text-rose-400 hover:text-rose-300 transition-colors mb-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t('back')}
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('title')}</h1>
          <p className="text-rose-200/60 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <ProjectForm />
    </div>
  );
}
