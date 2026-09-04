import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import CaseStudyClientWrapper from '@/app/[locale]/projects/[slug]/CaseStudyClientWrapper';
import { resolveList, resolveText, type LocalizedProject } from '@/lib/localizeProject';

type PageProps = { params: Promise<{ slug: string; locale: string }> };

function serializeProject(rawProject: LocalizedProject, locale: string) {
  return JSON.parse(JSON.stringify({
    ...rawProject,
    _id: (rawProject._id as { toString(): string }).toString(),
    title: resolveText(rawProject.title, rawProject, 'title', locale),
    description: resolveText(rawProject.description, rawProject, 'description', locale),
    sector: resolveText(rawProject.sector, rawProject, 'sector', locale),
    platform: typeof rawProject.platform === 'string' ? rawProject.platform : '',
    services: resolveList(rawProject.services, rawProject, 'services', locale),
    tools: resolveList(rawProject.tools, rawProject, 'tools', locale),
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params;
  await connectToDatabase();
  const rawProject = await Project.findOne({ slug }).lean() as unknown as LocalizedProject | null;

  if (!rawProject) return { title: 'Project Not Found' };

  const fallbackTitle = resolveText(rawProject.title, rawProject, 'title', locale);
  const fallbackDescription = resolveText(rawProject.description, rawProject, 'description', locale);
  const metaTitle = resolveText(rawProject.metaTitle, rawProject, 'title', locale);
  const metaDescription = resolveText(rawProject.metaDescription, rawProject, 'description', locale);

  const title = metaTitle || `${fallbackTitle} | Case Study`;
  const description = metaDescription || fallbackDescription || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function WorkCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  await connectToDatabase();

  const rawProject = await Project.findOne({ slug }).lean() as unknown as LocalizedProject | null;
  if (!rawProject) notFound();

  const rawNextProject = await Project.findOne({ slug: { $ne: slug } })
    .sort({ year: -1, createdAt: -1 })
    .select('title slug sector heroMediaUrl year sourceLang translations description')
    .lean() as unknown as LocalizedProject | null;

  return (
    <CaseStudyClientWrapper
      project={serializeProject(rawProject, locale)}
      nextProject={rawNextProject ? serializeProject(rawNextProject, locale) : undefined}
    />
  );
}