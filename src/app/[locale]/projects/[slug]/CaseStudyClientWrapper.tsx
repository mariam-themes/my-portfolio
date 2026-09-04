'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';

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

function ScrollToTop() {
  useEffect(() => {
    // Force scroll to top after the dynamic component fully mounts.
    // This fixes the issue where the page loads scrolled to the footer.
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return null;
}

export default function CaseStudyClientWrapper({ project, nextProject }: CaseStudyPresentationProps) {
  return (
    <>
      <ScrollToTop />
      <CaseStudyPresentation project={project} nextProject={nextProject} />
    </>
  );
}
