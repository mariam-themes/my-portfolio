'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

const CaseStudyPresentation = dynamic(() => import('@/components/public/CaseStudyPresentation'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading presentation...</p>
      </div>
    </div>
  ),
});

type CaseStudyPresentationProps = ComponentProps<typeof CaseStudyPresentation>;

export default function CaseStudyClientWrapper({ project, nextProject }: CaseStudyPresentationProps) {
  return <CaseStudyPresentation project={project} nextProject={nextProject} />;
}
