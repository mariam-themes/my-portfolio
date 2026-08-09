import ProjectForm from '@/components/admin/ProjectForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Add New Project | Admin Dashboard',
};

export default function AddProjectPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/projects" className="inline-flex items-center text-rose-400 hover:text-rose-300 transition-colors mb-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">Add New Project</h1>
          <p className="text-rose-200/60 mt-1">Fill out the details below to publish a new project to your portfolio.</p>
        </div>
      </div>

      <ProjectForm />
    </div>
  );
}
