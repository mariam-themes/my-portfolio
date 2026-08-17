import connectToDatabase from '@/lib/mongodb';
import { SectionLayout } from '@/models/SectionLayout';
import { HOME_SECTIONS } from '@/lib/home-sections';
import SectionLayoutManager from '@/components/admin/SectionLayoutManager';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: 'Homepage Sections | Admin Dashboard',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminSectionsPage() {
  const t = await getTranslations('Admin.homeSections');

  await connectToDatabase();
  const rawLayout = await SectionLayout.findOne({ key: 'home' }).lean();
  const dbMap = new Map<string, { isVisible: boolean; content?: unknown }>();
  if (rawLayout?.sections) {
    for (const s of rawLayout.sections as Array<{
      id: string;
      isVisible: boolean;
      content?: unknown;
    }>) {
      dbMap.set(s.id, { isVisible: s.isVisible, content: s.content });
    }
  }

  const sections = HOME_SECTIONS.map((sec) => ({
    id: sec.id,
    labelKey: sec.labelKey,
    isVisible: dbMap.get(sec.id)?.isVisible ?? sec.defaultVisible,
    content: dbMap.get(sec.id)?.content ?? null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {t('title')}
        </h1>
        <p className="text-rose-200/60 mt-1">{t('subtitle')}</p>
      </div>

      <div className="bg-rose-950/10 border border-rose-900/20 rounded-xl p-4 text-sm text-rose-200/60 leading-relaxed">
        {t('orderNote')}
      </div>

      <SectionLayoutManager initialSections={sections} />
    </div>
  );
}
