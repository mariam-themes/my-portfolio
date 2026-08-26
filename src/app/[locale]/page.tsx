import { getVisibleHomeSections } from '@/lib/home-layout';
import ScrollMotionWrapper from '@/components/public/ScrollMotionWrapper';
import connectToDatabase from '@/lib/mongodb';
import GlobalSettings, { DEFAULT_GLOBAL_SETTINGS } from '@/models/GlobalSettings';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();
  const settings = await GlobalSettings.findOne().lean();
  const data = { ...DEFAULT_GLOBAL_SETTINGS, ...(settings || {}) };

  const title = data.seoTitle || data.siteName || 'Mariam Aljumaiah';
  const description = data.seoDescription || '';

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

export default async function Home() {
  const sections = await getVisibleHomeSections();

  return (
    <main
      className="min-h-screen text-white relative overflow-x-clip"
      style={{
        background:
          'radial-gradient(circle at 88% 4%, rgba(125,15,46,0.32), transparent 26rem),' +
          'radial-gradient(circle at 8% 38%, rgba(81,8,29,0.24), transparent 32rem),' +
          '#0a0507',
      }}
    >
      <ScrollMotionWrapper>
        {sections.length === 0 ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <p className="text-white/40 font-light text-xl">
              All homepage sections are currently hidden.
            </p>
          </div>
        ) : (
          sections.map((section) => {
            const Component = section.component;
            return (
              <section
                key={section.id}
                id={section.id}
                aria-label={section.labelKey}
                className="relative z-10"
              >
                <Component />
              </section>
            );
          })
        )}
      </ScrollMotionWrapper>
    </main>
  );
}
