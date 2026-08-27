/**
 * Section registry — DATA ONLY (no React component imports).
 * Mirrors HOME_SECTIONS in home-sections.tsx but is safe to use
 * in API routes / server-side code without importing client components.
 */
export const HOME_SECTIONS_DATA = [
  { id: 'hero',             labelKey: 'hero',             defaultVisible: true },
  { id: 'projectsPreview',  labelKey: 'projectsPreview',  defaultVisible: true },
  { id: 'about',            labelKey: 'about',            defaultVisible: true },
  { id: 'services',         labelKey: 'services',         defaultVisible: true },
  { id: 'platforms',        labelKey: 'platforms',        defaultVisible: true },
  { id: 'featured-projects',labelKey: 'featuredProjects', defaultVisible: true },
  { id: 'other-projects',   labelKey: 'otherProjects',    defaultVisible: true },
  { id: 'testimonials',     labelKey: 'testimonials',     defaultVisible: true },
  { id: 'blog',             labelKey: 'blog',             defaultVisible: true },
  { id: 'contact',          labelKey: 'contact',          defaultVisible: true },
] as const;
