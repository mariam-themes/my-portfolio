import connectToDatabase from '@/lib/mongodb';
import Service from '@/models/Service';
import ServiceCategory from '@/models/ServiceCategory';
import { getLocale, getTranslations } from 'next-intl/server';
import ServicesClient, { type LocalizedServiceItem } from './ServicesClient';
import { type Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  
  const title = isAr
    ? 'جميع الخدمات | مريم الجميعة'
    : 'All Services | Mariam Aljumaiah';
  const description = isAr
    ? 'استكشف جميع الخدمات الرقمية والإبداعية: تصميم الهويات البصرية، واجهات وتجربة المستخدم، وتطوير المتاجر الإلكترونية.'
    : 'Explore full digital & creative services: visual identity design, UI/UX design, and custom e-commerce development.';

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

export default async function ServicesPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  let serializedServices: LocalizedServiceItem[] = [];
  let validCategories: { name: string; label: string }[] = [];

  try {
    await connectToDatabase();

    // 1. Fetch all services ordered
    const rawServices = await Service.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    serializedServices = rawServices.map((service: any, index: number) => {
      const title =
        isAr
          ? service.translations?.ar?.title || service.title
          : service.translations?.en?.title || service.title;
      const description =
        isAr
          ? service.translations?.ar?.description || service.description
          : service.translations?.en?.description || service.description;

      return {
        _id: String(service._id),
        title,
        description,
        image: service.image || '',
        category: (service.category || '').trim(),
        tags: Array.isArray(service.tags) ? service.tags : [],
        order: service.order ?? index,
      };
    });

    // 2. Fetch all service categories from DB
    const rawCategories = await ServiceCategory.find({})
      .sort({ name: 1 })
      .lean();

    // Filter categories: only include those that have at least one service
    const activeCategoryNames = new Set(
      serializedServices
        .map((s) => s.category.toLowerCase())
        .filter((c) => Boolean(c))
    );

    validCategories = rawCategories
      .filter((cat: any) => activeCategoryNames.has((cat.name || '').trim().toLowerCase()))
      .map((cat: any) => ({
        name: cat.name,
        label: isAr ? cat.nameAr || cat.name : cat.nameEn || cat.name,
      }));
  } catch (error) {
    console.error('Failed to load services for ServicesPage:', error);
  }

  return (
    <main className="min-h-screen bg-transparent relative overflow-x-hidden">
      <ServicesClient services={serializedServices} categories={validCategories} />
    </main>
  );
}

