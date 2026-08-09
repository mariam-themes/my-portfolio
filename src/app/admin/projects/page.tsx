import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import Link from 'next/link';
import { Plus, Edit2 } from 'lucide-react';
import DeleteProjectButton from './DeleteProjectButton';
import Image from 'next/image';

export const metadata = {
  title: 'Projects | Admin Dashboard',
};

// Next.js config to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminProjectsPage() {
  await connectToDatabase();
  const rawProjects = await Project.find().sort({ createdAt: -1 }).lean();
  const projects = rawProjects.map((p: any) => ({
    ...p,
    title: typeof p.title === 'object' ? p.title?.en || '' : p.title,
    sector: typeof p.sector === 'object' ? p.sector?.en || '' : p.sector,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-rose-200/60 mt-1">Manage your portfolio case studies.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-rose-900/20"
        >
          <Plus className="w-5 h-5" />
          Add New Project
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-12 text-center">
          <p className="text-rose-300">No projects found. Start by creating one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div
              key={project._id.toString()}
              className="bg-black/40 border border-rose-900/30 rounded-xl overflow-hidden flex flex-col transition-all hover:border-rose-700/50 hover:shadow-lg hover:shadow-rose-900/10"
            >
              {/* Cover Image */}
              <div className="relative aspect-video w-full bg-rose-950/50">
                {project.heroMediaUrl ? (
                  <Image
                    src={project.heroMediaUrl}
                    alt={project.title || 'Project cover'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-rose-500/30 text-sm">
                    No Cover
                  </div>
                )}
                {project.isFeatured && (
                  <span className="absolute top-3 right-3 bg-amber-500/90 text-amber-50 px-2 py-1 rounded text-xs font-bold shadow-lg">
                    Featured
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                  {project.title}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-rose-950/50 text-rose-300 px-2 py-1 rounded border border-rose-900/50">
                    {project.year}
                  </span>
                  {project.sector && (
                    <span className="text-xs bg-rose-950/50 text-rose-300 px-2 py-1 rounded border border-rose-900/50">
                      {project.sector}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-rose-900/30 flex items-center justify-between">
                  <Link
                    href={`/admin/projects/${project._id}`}
                    className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                  </Link>
                  <DeleteProjectButton projectId={project._id.toString()} title={project.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
