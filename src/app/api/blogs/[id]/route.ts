import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/models/Blog';
import { slugify } from '@/lib/slugify';
import { autoTranslate, isArabic, translateHtmlContent } from '@/lib/translate';

// ─── helpers ─────────────────────────────────────────────────────────────────

function localize(blogObj: any, locale: string) {
  const tSet = blogObj.translations?.[locale as 'en' | 'ar'];
  if (locale !== blogObj.sourceLang && tSet) {
    return {
      ...blogObj,
      title: tSet.title || blogObj.title,
      excerpt: tSet.excerpt || blogObj.excerpt,
      content: tSet.content || blogObj.content,
    };
  }
  return blogObj;
}

// ─── GET /api/blogs/[id] ─────────────────────────────────────────────────────

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || 'ar';

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const blog = await Blog.findOne(query).lean<any>();
    if (!blog) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    const localized = localize(blog, locale);
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(localized)) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// ─── PUT /api/blogs/[id] ─────────────────────────────────────────────────────

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();

    if (body.slug) {
      body.slug = slugify(body.slug);
    }

    const sourceLang: 'en' | 'ar' = isArabic(body.title || '') ? 'ar' : 'en';
    const target: 'en' | 'ar' = sourceLang === 'ar' ? 'en' : 'ar';

    const [tTitle, tExcerpt, tContent] = await Promise.all([
      body.title ? autoTranslate(body.title).then((r) => r[target]) : Promise.resolve(''),
      body.excerpt ? autoTranslate(body.excerpt).then((r) => r[target]) : Promise.resolve(''),
      body.content ? translateHtmlContent(body.content, target) : Promise.resolve(''),
    ]);

    body.sourceLang = sourceLang;
    body.translations = {
      [target]: { title: tTitle, excerpt: tExcerpt, content: tContent },
    };

    const blog = await Blog.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!blog) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: blog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// ─── DELETE /api/blogs/[id] ──────────────────────────────────────────────────

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
