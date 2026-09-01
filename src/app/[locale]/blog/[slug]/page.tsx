import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ar as arLocale, enUS } from 'date-fns/locale';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/models/Blog';
import { slugify } from '@/lib/slugify';
import { autoTranslate, isArabic, translateHtmlContent } from '@/lib/translate';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export const dynamic = 'force-dynamic';

function localize(blogObj: any, locale: string) {
  const result = { ...blogObj };
  const tSet = blogObj.translations?.[locale as 'en' | 'ar'];
  if (locale !== blogObj.sourceLang && tSet) {
    if (tSet.title) result.title = tSet.title;
    if (tSet.excerpt) result.excerpt = tSet.excerpt;
    if (tSet.content) result.content = tSet.content;
  }
  return result;
}

async function getBlog(slug: string, locale: string) {
  await connectToDatabase();

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
  const candidates = Array.from(new Set([slug, slugify(slug)])).filter(Boolean);
  const query = isObjectId ? { _id: slug } : { slug: { $in: candidates } };

  const blog = await Blog.findOne(query).lean<any>();
  if (!blog) return null;

  const sourceLang = blog.sourceLang || (isArabic(blog.title || '') ? 'ar' : 'en');
  const target: 'en' | 'ar' = sourceLang === 'ar' ? 'en' : 'ar';
  const existingContent = blog.translations?.[target]?.content;

  // Needs translation if: no content saved, OR saved content is still in the source language
  const contentIsWrongLang = existingContent
    ? target === 'en' ? isArabic(existingContent) : !isArabic(existingContent)
    : false;
  const needsTranslation = !existingContent || contentIsWrongLang;

  if (!blog.sourceLang || needsTranslation) {
    const [tTitle, tExcerpt, tContent] = await Promise.all([
      blog.title ? autoTranslate(blog.title).then((r) => r[target]) : Promise.resolve(''),
      blog.excerpt ? autoTranslate(blog.excerpt).then((r) => r[target]) : Promise.resolve(''),
      blog.content ? translateHtmlContent(blog.content, target) : Promise.resolve(''),
    ]);

    // Persist using $set so Mongoose strict mode doesn't block it
    await Blog.findByIdAndUpdate(blog._id, {
      $set: {
        sourceLang,
        [`translations.${target}.title`]: tTitle,
        [`translations.${target}.excerpt`]: tExcerpt,
        [`translations.${target}.content`]: tContent,
      },
    });

    blog.sourceLang = sourceLang;
    blog.translations = {
      ...(blog.translations || {}),
      [target]: { title: tTitle, excerpt: tExcerpt, content: tContent },
    };
  }

  return JSON.parse(JSON.stringify(localize(blog, locale)));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const blog = await getBlog(slug, locale);

  if (!blog) {
    return { title: 'Post Not Found' };
  }

  const title = blog.seoTitle?.[locale as 'en' | 'ar'] || blog.title || 'Untitled Post';
  const description = blog.seoDescription?.[locale as 'en' | 'ar'] || blog.excerpt || '';

  return {
    title: `${title} | Mariam Portfolio`,
    description,
    openGraph: {
      title,
      description,
      images: blog.coverImage ? [blog.coverImage] : [],
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const blog = await getBlog(slug, locale);
  const t = await getTranslations({ locale, namespace: 'BlogPage' });

  if (!blog) {
    notFound();
  }

  const dateLocale = locale === 'ar' ? arLocale : enUS;
  const formattedDate = format(new Date(blog.createdAt), 'MMMM d, yyyy', { locale: dateLocale });

  return (
    <div className="min-h-screen bg-[#0a0507] text-white relative">
      {/* Article Header & Cover */}
      <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-rose-950/30">
        {blog.coverImage && (
          <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.coverImage}
              alt="Background"
              className="w-full h-full object-cover blur-3xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0507]" />
          </div>
        )}

        <div className="container mx-auto px-6 lg:px-8 max-w-4xl relative z-10">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-semibold tracking-wide text-rose-400 hover:text-rose-300 transition-colors uppercase mb-12 group"
          >
            <ArrowLeft className="mr-2 rtl:mr-0 rtl:ml-2 w-4 h-4 transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform duration-300" />
            {t('backToStories')}
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium uppercase tracking-widest text-white/40 mb-6">
            <time dateTime={blog.createdAt}>{formattedDate}</time>
            {blog.tags && blog.tags.map((tag: string) => (
              <span key={tag} className="flex items-center gap-4">
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#951C30' }} />
                <span className="text-rose-400">{tag}</span>
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-white leading-[1.1]">
            {blog.title}
          </h1>

          <p
            className="text-xl md:text-2xl text-white/60 font-light leading-relaxed max-w-3xl border-l-2 rtl:border-l-0 rtl:border-r-2 px-6 ml-1 rtl:ml-0 rtl:mr-1"
            style={{ borderColor: '#951C30' }}
          >
            {blog.excerpt}
          </p>
        </div>
      </div>

      {/* Hero Image */}
      {blog.coverImage && (
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl -mt-8 md:-mt-12 relative z-20">
          <div className="w-full aspect-[21/9] md:aspect-[2.5/1] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="container mx-auto px-6 lg:px-8 max-w-3xl py-20 md:py-32">
        <article
          className="prose prose-lg md:prose-xl prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-strong:text-inherit prose-a:text-rose-400 hover:prose-a:text-rose-300 prose-img:rounded-2xl prose-img:shadow-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <div className="mt-20 pt-10 border-t border-rose-950/30 flex justify-between items-center">
          <p className="text-white/40 italic">{t('endOfArticle')}</p>
          <Link href="/blog" className="text-rose-400 font-semibold hover:underline">
            {t('readMore')}
          </Link>
        </div>
      </div>
    </div>
  );
}