import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import Category from '@/models/Category';
import { getLocale, getTranslations } from 'next-intl/server';
import ProjectsClientWrapper from '@/app/[locale]/projects/ProjectsClientWrapper';
import type { ProjectRecord } from '@/app/[locale]/projects/ProjectListClient';
import { resolveText, type LocalizedProject } from '@/lib/localizeProject';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Work' });
  return {
    title: t('metaTitle') || 'Selected Works | Portfolio',
    description: t('metaDescription') || 'Explore my latest design projects and case studies.',
  };
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams?: Promise<{ all?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  // Default to showing only featured projects, unless ?all=true is passed
  const showAll = resolvedSearchParams?.all === 'true';
  const featuredOnly = !showAll;

  const locale = await getLocale();
  let serializedProjects: ProjectRecord[] = [];

  try {
    await connectToDatabase();
    // Always show all projects on the /work page, newest-first.
    const projects = await Project.find({})
      .sort({ year: -1, createdAt: -1 })
      .select('title slug sector category heroMediaUrl year sourceLang translations isFeatured')
      .lean();

    serializedProjects = (
      JSON.parse(JSON.stringify(projects)) as LocalizedProject[]
    ).map((project) => ({
      _id: String(project._id),
      slug: project.slug as string,
      heroMediaUrl: project.heroMediaUrl as string,
      year: (project.year as number) || new Date().getFullYear(),
      title: resolveText(project.title, project, 'title', locale),
      category: resolveText(project.category, project, 'category', locale),
      sector: resolveText(project.sector, project, 'sector', locale),
      isFeatured: !!project.isFeatured,
    }));
  } catch (error) {
    console.error('Failed to load projects for WorkPage:', error);
  }

  // Fetch valid category names from the Category collection — localised for current page locale
  let validCategories: { name: string; label: string }[] = [];
  try {
    const cats = await Category.find({}).select('name nameEn nameAr').sort({ name: 1 }).lean() as { name: string; nameEn?: string; nameAr?: string }[];
    validCategories = cats.map((c) => ({
      name: c.name,                                          // original (for matching)
      label: locale === 'ar' ? (c.nameAr || c.name) : (c.nameEn || c.name), // localized (for display)
    }));
  } catch {
    // non-fatal — filter just won't show
  }

  return (
    <main className="min-h-screen bg-transparent">
      <ProjectsClientWrapper projects={serializedProjects} featuredOnly={featuredOnly} validCategories={validCategories} />
    </main>
  );
}
