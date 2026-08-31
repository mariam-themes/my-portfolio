import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongodb';
import { Testimonial } from '@/models/Testimonial';
import { logActivity, extractIp } from '@/lib/activity-log';

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as any });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return token;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await requireAdmin(request);
  if (token instanceof NextResponse) return token;

  try {
    const { id } = await params;
    await connectToDatabase();
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return NextResponse.json({ success: false, error: 'Testimonial not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: testimonial });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await requireAdmin(request);
  if (token instanceof NextResponse) return token;

  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();
    const testimonial = await Testimonial.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!testimonial) {
      return NextResponse.json({ success: false, error: 'Testimonial not found' }, { status: 404 });
    }

    await logActivity({
      adminId: token.id || 'unknown',
      action: 'TESTIMONIAL_UPDATE',
      entityType: 'testimonial',
      entityId: id,
      details: { name: testimonial.name, rating: testimonial.rating, isApproved: testimonial.isApproved },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await requireAdmin(request);
  if (token instanceof NextResponse) return token;

  try {
    const { id } = await params;
    await connectToDatabase();
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      return NextResponse.json({ success: false, error: 'Testimonial not found' }, { status: 404 });
    }

    await logActivity({
      adminId: token.id || 'unknown',
      action: 'TESTIMONIAL_DELETE',
      entityType: 'testimonial',
      entityId: id,
      details: { name: testimonial.name, rating: testimonial.rating },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
