import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/models/Blog';
import { slugify } from '@/lib/slugify';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    // We allow fetching by either ID or slug for convenience
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { slug: id };
    
    const blog = await Blog.findOne(query);
    if (!blog) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: blog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();

    if (body.slug) {
      body.slug = slugify(body.slug);
    }

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
