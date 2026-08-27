import type { ComponentType } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import ProjectsPreviewSection from '@/components/sections/ProjectsPreviewSection';
import AboutMeSection from '@/components/sections/AboutMeSection';
import ServicesSection from '@/components/sections/ServicesSection';
import PlatformsSection from '@/components/sections/PlatformsSection';
import FeaturedProjectsSection from '@/components/sections/FeaturedProjectsSection';
import OtherProjectsSection from '@/components/sections/OtherProjectsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import BlogSection from '@/components/sections/BlogSection';
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
    id: 'projectsPreview',
    labelKey: 'work',
    component: ProjectsPreviewSection,
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
    labelKey: 'services',
    component: ServicesSection,
    defaultVisible: true,
  },
  {
    id: 'platforms',
    labelKey: 'platforms',
    component: PlatformsSection,
    defaultVisible: true,
  },
  {
    id: 'featured-projects',
    labelKey: 'featuredProjects',
    component: FeaturedProjectsSection,
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
    id: 'blog',
    labelKey: 'blog',
    component: BlogSection,
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