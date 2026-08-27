import type { ComponentType } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import SelectedProjectsSection from '@/components/sections/SelectedProjectsSection';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
import ProjectsPreviewSection from '@/components/sections/ProjectsPreviewSection';
import OtherProjectsSection from '@/components/sections/OtherProjectsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ContactSection from '@/components/sections/ContactSection';

export interface HomeSection {
  id: string;
  labelKey: string;
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
    id: 'selected-projects',
    labelKey: 'projectsPreview',
    component: SelectedProjectsSection,
    defaultVisible: true,
  },
  {
    id: 'about',
    labelKey: 'about',
    component: AboutSection,
    defaultVisible: true,
  },
  {
    id: 'services',
    labelKey: 'services',
    component: ServicesSection,
    defaultVisible: true,
  },
  {
    id: 'projectsPreview',
    labelKey: 'featuredProjects', // Now maps to 'Featured Project'
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
    id: 'testimonials',
    labelKey: 'testimonials',
    component: TestimonialsSection,
    defaultVisible: true,
  },
  {
    id: 'contact',
    labelKey: 'contact',
    component: ContactSection,
    defaultVisible: true,
  },
];

export const HOME_SECTION_ORDER = HOME_SECTIONS.map((s) => s.id);

export function getHomeSectionById(id: string): HomeSection | undefined {
  return HOME_SECTIONS.find((s) => s.id === id);
}