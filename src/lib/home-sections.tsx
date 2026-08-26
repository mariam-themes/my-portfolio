import type { ComponentType } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import ProjectsPreviewSection from '@/components/sections/ProjectsPreviewSection';
import OtherProjectsSection from '@/components/sections/OtherProjectsSection';
import BlogSection from '@/components/sections/BlogSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ContactSection from '@/components/sections/ContactSection';
import AboutMeSection from '@/components/sections/AboutMeSection';

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
    id: 'hero',
    labelKey: 'hero',
    component: HeroSection,
    defaultVisible: true,
  },
  {
    id: 'about',
    labelKey: 'about',
    component: AboutMeSection,
    defaultVisible: true,
  },
  {
    id: 'services',
    labelKey: 'services', // Can add to Admin.homeSections.services
    component: ServicesSection,
    defaultVisible: true,
  },
  {
    id: 'projectsPreview',
    labelKey: 'projectsPreview', // We'll add this to i18n later if needed, or it can reuse a key
    component: ProjectsPreviewSection,
    defaultVisible: true,
  },
  {
    id: 'other-projects',
    labelKey: 'otherProjects',
    component: OtherProjectsSection,
    defaultVisible: true,
  },
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
  {
    id: 'contact',
    labelKey: 'contact', // Can add to i18n later if needed for admin panel
    component: ContactSection,
    defaultVisible: true,
  },
];

/** Ordered section ids (the fixed presentation order). */
export const HOME_SECTION_ORDER = HOME_SECTIONS.map((s) => s.id);

export function getHomeSectionById(id: string): HomeSection | undefined {
  return HOME_SECTIONS.find((s) => s.id === id);
}