import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/models/Blog';
import { localizeText } from '@/lib/translate';
import { slugify } from '@/lib/slugify';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Determine target locale from cookies or referer (next-intl sets NEXT_LOCALE)
    const cookieStore = await cookies();
    let locale = cookieStore.get('NEXT_LOCALE')?.value as 'en' | 'ar' | undefined;
    
    if (!locale) {
      const referer = request.headers.get('referer') || '';
      locale = referer.includes('/ar') ? 'ar' : 'en';
    }
    
    const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
    
    // Translate fields on the fly
    const localizedBlogs = await Promise.all(
      blogs.map(async (blog) => {
        return {
          ...blog,
          title: await localizeText(blog.title, locale),
          content: await localizeText(blog.content, locale),
          excerpt: blog.excerpt ? await localizeText(blog.excerpt, locale) : blog.excerpt,
        };
      })
    );
    
    return NextResponse.json({ success: true, data: localizedBlogs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.slug && body.title) {
      body.slug = slugify(body.title);
    } else if (body.slug) {
      body.slug = slugify(body.slug);
    }

    const blog = await Blog.create(body);
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
