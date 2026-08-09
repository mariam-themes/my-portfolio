'use client';

import dynamic from 'next/dynamic';
import type { ProjectRecord } from './ProjectListClient';

const ProjectListClient = dynamic(() => import('./ProjectListClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading projects...</p>
      </div>
    </div>
  ),
});

export default function ProjectsClientWrapper({ projects }: { projects: ProjectRecord[] }) {
  return <ProjectListClient projects={projects} />;
}
