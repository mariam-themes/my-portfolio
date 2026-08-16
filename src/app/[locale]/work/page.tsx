import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectsClientWrapper from '@/app/[locale]/projects/ProjectsClientWrapper';
import type { ProjectRecord } from '@/app/[locale]/projects/ProjectListClient';

type LocalizedText = string | { en?: string };
type ProjectListRecord = {
  _id: { toString(): string } | string;
  slug: string;
  heroMediaUrl: string;
  year: number;
  title?: LocalizedText;
  sector?: LocalizedText;
  category?: LocalizedText;
};

export const metadata = {
  title: 'Selected Works | Portfolio',
  description: 'Explore my latest design projects and case studies.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function WorkPage() {
  await connectToDatabase();

  const projects = await Project.find()
    .sort({ year: -1, createdAt: -1 })
    .select('title slug sector category heroMediaUrl year')
    .lean();

  const serializedProjects: ProjectRecord[] = (
    JSON.parse(JSON.stringify(projects)) as ProjectListRecord[]
  ).map((project) => ({
    _id: String(project._id),
    slug: project.slug,
    heroMediaUrl: project.heroMediaUrl,
    year: project.year,
    title: typeof project.title === 'object' ? project.title?.en || '' : project.title || '',
    category:
      typeof project.category === 'object' ? project.category?.en || '' : project.category || '',
    sector:
      typeof project.sector === 'object' ? project.sector?.en || '' : project.sector || '',
  }));

  return (
    <main className="bg-black min-h-screen">
      <ProjectsClientWrapper projects={serializedProjects} />
    </main>
  );
}