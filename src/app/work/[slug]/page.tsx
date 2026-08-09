import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { notFound } from 'next/navigation';
import CaseStudyClientWrapper from '@/app/projects/[slug]/CaseStudyClientWrapper';

type PageProps = { params: Promise<{ slug: string }> };
type LocalizedText = string | { en?: string };
type LocalizedList = string[] | { en?: string[] };
type ProjectRecord = {
  _id: { toString(): string };
  title: LocalizedText;
  description?: LocalizedText;
  sector?: LocalizedText;
  platform?: LocalizedText;
  services?: LocalizedList;
  tools?: LocalizedList;
  [key: string]: unknown;
};

function textValue(value: LocalizedText | undefined) {
  return typeof value === 'object' ? value.en || '' : value || '';
}

function listValue(value: LocalizedList | undefined) {
  return Array.isArray(value) ? value : value?.en || [];
}

function serializeProject(rawProject: ProjectRecord) {
  return JSON.parse(JSON.stringify({
    ...rawProject,
    _id: rawProject._id.toString(),
    title: textValue(rawProject.title),
    description: textValue(rawProject.description),
    sector: textValue(rawProject.sector),
    platform: textValue(rawProject.platform),
    services: listValue(rawProject.services),
    tools: listValue(rawProject.tools),
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  await connectToDatabase();
  const rawProject = await Project.findOne({ slug }).lean() as unknown as ProjectRecord | null;

  if (!rawProject) return { title: 'Project Not Found' };

  const title = textValue(rawProject.title);
  const description = textValue(rawProject.description);

  return { title: `${title} | Case Study`, description: description || '' };
}

export default async function WorkCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  await connectToDatabase();

  const rawProject = await Project.findOne({ slug }).lean() as unknown as ProjectRecord | null;
  if (!rawProject) notFound();

  const rawNextProject = await Project.findOne({ slug: { $ne: slug } })
    .sort({ year: -1, createdAt: -1 })
    .select('title slug sector heroMediaUrl year')
    .lean() as unknown as ProjectRecord | null;

  return (
    <CaseStudyClientWrapper
      project={serializeProject(rawProject)}
      nextProject={rawNextProject ? serializeProject(rawNextProject) : undefined}
    />
  );
}
