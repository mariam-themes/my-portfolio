import type { ComponentType } from 'react';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import BlogSection from '@/components/sections/BlogSection';

/**
 * Homepage section registry — the SINGLE source of truth for which sections
 * exist on the homepage and the FIXED order they render in (per client
 * requirement: no dashboard reordering).
 *
 * To add/remove/rework a homepage section you only edit this array — no DB,
 * API or schema changes are needed. The DB (`SectionLayout`) stores only the
 * per-section visibility toggle (and optional future content).
 */
export interface HomeSection {
  id: string;
  labelKey: string; // i18n key for the admin label (Admin.homeSections.*)
  component: ComponentType;
  defaultVisible: boolean;
}

export type HomeSectionId = HomeSection['id'];

export const HOME_SECTIONS: HomeSection[] = [
  {
    id: 'blog',
    labelKey: 'blog',
    component: BlogSection,
    defaultVisible: true,
  },
  {
    id: 'testimonials',
    labelKey: 'testimonials',
    component: TestimonialsSection,
    defaultVisible: true,
  },
];

/** Ordered section ids (the fixed presentation order). */
export const HOME_SECTION_ORDER = HOME_SECTIONS.map((s) => s.id);

export function getHomeSectionById(id: string): HomeSection | undefined {
  return HOME_SECTIONS.find((s) => s.id === id);
}