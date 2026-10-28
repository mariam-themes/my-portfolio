import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/models/Blog';
import { slugify } from '@/lib/slugify';
import { autoTranslate, isArabic, translateHtmlContent } from '@/lib/translate';

// ─── helpers ─────────────────────────────────────────────────────────────────

function localizeBlogs(blogs: any[], locale: string) {
  return blogs.map((blog) => {
    const tSet = blog.translations?.[locale as 'en' | 'ar'];
    if (locale !== blog.sourceLang && tSet) {
      return {
        ...blog,
        title: tSet.title || blog.title,
        excerpt: tSet.excerpt || blog.excerpt,
      };
    }
    return blog;
  });
}

// ─── GET /api/blogs ──────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const cookieStore = await cookies();
    const locale =
      url.searchParams.get('locale') ||
      cookieStore.get('NEXT_LOCALE')?.value ||
      'ar';

    const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean<any[]>();

    return NextResponse.json({
      success: true,
      data: localizeBlogs(blogs, locale),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── POST /api/blogs ─────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.slug && body.title) {
      body.slug = slugify(body.title);
    } else if (body.slug) {
      body.slug = slugify(body.slug);
    }

    const sourceLang: 'en' | 'ar' = isArabic(body.title || '') ? 'ar' : 'en';
    const target: 'en' | 'ar' = sourceLang === 'ar' ? 'en' : 'ar';

    const [tTitle, tExcerpt, tContent] = await Promise.all([
      body.title ? autoTranslate(body.title).then((r: any) => r[target]) : Promise.resolve(''),
      body.excerpt ? autoTranslate(body.excerpt).then((r: any) => r[target]) : Promise.resolve(''),
      body.content ? translateHtmlContent(body.content, target) : Promise.resolve(''),
    ]);

    body.sourceLang = sourceLang;
    body.translations = {
      [target]: { title: tTitle, excerpt: tExcerpt, content: tContent },
    };

    const blog = await Blog.create(body);
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
