import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { getLocale } from 'next-intl/server';
import ProjectsClientWrapper from '@/app/[locale]/projects/ProjectsClientWrapper';
import type { ProjectRecord } from '@/app/[locale]/projects/ProjectListClient';
import FeaturedProjectsGrid from '@/components/public/FeaturedProjectsGrid';
import { resolveText, type LocalizedProject } from '@/lib/localizeProject';

export const metadata = {
  title: 'Selected Works | Portfolio',
  description: 'Explore my latest design projects and case studies.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ featured?: string }>;
}) {
  const { featured } = await searchParams;
  const featuredOnly = featured === 'true';

  // Featured view: reuse the rich Featured Projects display (all flagged projects).
  if (featuredOnly) {
    return (
      <main className="min-h-screen bg-transparent">
        <FeaturedProjectsGrid />
      </main>
    );
  }

  const locale = await getLocale();
  await connectToDatabase();

  // Oldest-first (ascending by year) so the list reads in date order.
  const projects = await Project.find()
    .sort({ year: 1, createdAt: 1 })
    .select('title slug sector category heroMediaUrl year sourceLang translations')
    .lean();

  const serializedProjects: ProjectRecord[] = (
    JSON.parse(JSON.stringify(projects)) as LocalizedProject[]
  ).map((project) => ({
    _id: String(project._id),
    slug: project.slug as string,
    heroMediaUrl: project.heroMediaUrl as string,
    year: project.year as number,
    title: resolveText(project.title, project, 'title', locale),
    category: resolveText(project.category, project, 'category', locale),
    sector: resolveText(project.sector, project, 'sector', locale),
  }));

  return (
    <main className="min-h-screen bg-transparent">
      <ProjectsClientWrapper projects={serializedProjects} />
    </main>
  );
}
