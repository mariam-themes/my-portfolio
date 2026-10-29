import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import Category from '@/models/Category';
import { getLocale, getTranslations } from 'next-intl/server';
import { resolveText, type LocalizedProject } from '@/lib/localizeProject';
import MarketplaceClient, { type MarketplaceProject } from './MarketplaceClient';
import { type Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'VisualIdentitiesForSale' });
  return {
    title: t('metaTitle') || 'Visual Identities for Sale | Portfolio',
    description: t('metaDescription') || 'Browse and purchase premium ready-made visual identities.',
    openGraph: {
      title: t('metaTitle') || 'Visual Identities for Sale | Portfolio',
      description: t('metaDescription') || 'Browse and purchase premium ready-made visual identities.',
      type: 'website',
    },
  };
}

export default async function MarketplacePage() {
  const locale = await getLocale();
  let serializedProjects: MarketplaceProject[] = [];

  try {
    await connectToDatabase();
    const projects = await Project.find({ isForSale: true })
      .sort({ saleOrder: 1, createdAt: -1 })
      .select('title slug description sector category heroMediaUrl year price currency sourceLang translations isForSale')
      .lean();

    serializedProjects = (
      JSON.parse(JSON.stringify(projects)) as LocalizedProject[]
    ).map((project) => ({
      _id: String(project._id),
      slug: (project.slug as string) || '',
      heroMediaUrl: (project.heroMediaUrl as string) || '',
      year: (project.year as number) || new Date().getFullYear(),
      price: (project.price as number) || 0,
      currency: (project.currency as string) || 'SAR',
      title: resolveText(project.title, project, 'title', locale),
      description: resolveText(project.description, project, 'description', locale),
      category: resolveText(project.category, project, 'category', locale),
      sector: resolveText(project.sector, project, 'sector', locale),
      rawCategory: (project.category as string) || '',
      isForSale: true,
    }));
  } catch (error) {
    console.error('Failed to load projects for MarketplacePage:', error);
  }

  let validCategories: { name: string; label: string }[] = [];
  try {
    const cats = (await Category.find({}).select('name nameEn nameAr').sort({ name: 1 }).lean()) as {
      name: string;
      nameEn?: string;
      nameAr?: string;
    }[];
    validCategories = cats.map((c) => ({
      name: c.name,
      label: locale === 'ar' ? c.nameAr || c.name : c.nameEn || c.name,
    }));
  } catch (error) {
    console.error('Failed to load categories for MarketplacePage:', error);
  }

  return (
    <main className="min-h-screen bg-transparent">
      <MarketplaceClient projects={serializedProjects} validCategories={validCategories} />
    </main>
  );
}
