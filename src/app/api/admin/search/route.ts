import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { Blog } from '@/models/Blog';
import { Inquiry } from '@/models/Inquiry';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    await connectToDatabase();

    // Case-insensitive regex
    const regex = new RegExp(q, 'i');

    // 1. Search Projects
    const projectsPromise = Project.find({
      $or: [
        { title: regex },
        { 'translations.en.title': regex },
        { 'translations.ar.title': regex },
        { category: regex },
        { 'translations.en.category': regex },
        { 'translations.ar.category': regex },
      ]
    }).limit(5).lean();

    // 2. Search Blogs
    const blogsPromise = Blog.find({
      $or: [
        { title: regex },
        { tags: regex },
      ]
    }).limit(5).lean();

    // 3. Search Inquiries
    const inquiriesPromise = Inquiry.find({
      $or: [
        { name: regex },
        { email: regex },
        { service: regex },
      ]
    }).limit(5).lean();

    const [projects, blogs, inquiries] = await Promise.all([projectsPromise, blogsPromise, inquiriesPromise]);

    const results = [
      ...projects.map((p: any) => ({
        _id: p._id.toString(),
        type: 'project',
        title: p.title || p.translations?.en?.title || p.translations?.ar?.title || 'Untitled',
        subtitle: p.category || 'Project',
        url: `/admin/projects/${p._id}`
      })),
      ...blogs.map((b: any) => ({
        _id: b._id.toString(),
        type: 'blog',
        title: b.title,
        subtitle: 'Blog Article',
        url: `/admin/blogs`
      })),
      ...inquiries.map((i: any) => ({
        _id: i._id.toString(),
        type: 'inquiry',
        title: i.name,
        subtitle: i.service,
        url: `/admin/inquiries`
      }))
    ];

    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
