import ProjectForm from '@/components/admin/ProjectForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';

export const metadata = {
  title: 'Edit Project | Admin Dashboard',
};

async function getProject(id: string) {
  try {
    await connectToDatabase();
    const project = await Project.findById(id).lean();
    if (!project) return null;
    
    // Convert ObjectId to string to pass to Client Component safely
    const serializedProject = JSON.parse(JSON.stringify(project));
    return serializedProject;
  } catch (error) {
    return null;
  }
}

export default async function EditProjectPage(
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  // Await the params safely across Next 14/15
  const resolvedParams = await props.params;
  const project = await getProject(resolvedParams.id);

  if (!project) {
    notFound();
  }

  const t = await getTranslations('Admin.projectEdit');
  const title = project.title?.en || project.title || '';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/projects" className="inline-flex items-center text-rose-400 hover:text-rose-300 transition-colors mb-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t('back')}
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('title')}</h1>
          <p className="text-rose-200/60 mt-1">{t('subtitle', { title })}</p>
        </div>
      </div>

      <ProjectForm initialData={project} />
    </div>
  );
}
