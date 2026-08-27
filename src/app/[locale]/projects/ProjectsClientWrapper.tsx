'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { ProjectRecord } from './ProjectListClient';

function LoadingProjects() {
  const t = useTranslations('Work');
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
      </div>
    </div>
  );
}

const ProjectListClient = dynamic(() => import('./ProjectListClient'), {
  ssr: false,
  loading: () => <LoadingProjects />,
});

export default function ProjectsClientWrapper({ projects, featuredOnly }: { projects: ProjectRecord[]; featuredOnly?: boolean }) {
  return <ProjectListClient projects={projects} featuredOnly={featuredOnly} />;
}
