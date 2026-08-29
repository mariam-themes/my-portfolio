import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlogPage' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

async function getBlogs() {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/blogs`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.success ? json.data : [];
}

export default async function BlogIndexPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlogPage' });
  const blogs = await getBlogs();

  return (
    <div
      className="min-h-screen pb-32 text-white overflow-hidden relative"
      style={{
        background:
          'radial-gradient(circle at 90% 8%, rgba(125,15,46,0.28), transparent 30rem),' +
          'radial-gradient(circle at 12% 92%, rgba(93,12,36,0.22), transparent 34rem),' +
          '#0a0507',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 pt-32 pb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="lg:w-1/2">
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl font-normal tracking-tight leading-[0.95] mb-6 text-[#fff]">
              {t('title')}
              <span className="block italic mt-2" style={{ color: '#951C30' }}>{t('titleAccent')}</span>
            </h1>
          </div>
          <div className="lg:w-1/2">
            <p className="max-w-md text-white/55 font-sans text-lg leading-relaxed lg:ml-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-40 text-white/30 font-light text-xl">
            {t('empty')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-start">
            {blogs.map((blog: any, i: number) => {
              const isRightColumn = i % 2 !== 0;
              return (
                <Link
                  key={String(blog._id ?? blog.slug ?? `blog-${i}`)}
                  href={`/blog/${blog.slug}`}
                  className={`block group ${isRightColumn ? 'md:mt-32' : ''}`}
                >
                  <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden rounded-xl bg-[#180608] border border-white/10">
                    {blog.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 font-light">
                        {t('noImage')}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white/90 group-hover:text-white transition-colors">
                      {blog.title}
                    </h2>
                    <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                      <span>{new Date(blog.createdAt).getFullYear()}</span>
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#951C30' }} />
                      <span>{blog.tags?.[0] || 'Journal'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}