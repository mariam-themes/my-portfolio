import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongodb';
import { Testimonial } from '@/models/Testimonial';
import { logActivity, extractIp } from '@/lib/activity-log';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';
    
    // Public access: only approved testimonials
    if (isPublic) {
      const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 }).lean();
      const localizedTestimonials = testimonials.map((testimonial) => {
        const t = { ...testimonial };
        if (t.email) {
          delete t.email;
        }
        return t;
      });
      return NextResponse.json({ success: true, data: localizedTestimonials });
    }
    
    // Admin access: all testimonials (requires valid admin token)
    const token = await getToken({ req: request as any });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Only an authenticated admin can publish a testimonial directly (e.g. from
    // the dashboard). Public submissions are always forced to pending so they
    // can't bypass moderation by spoofing `isApproved` in the body.
    const token = await getToken({ req: request as any });
    const isAdmin = !!token;
    const isApproved = isAdmin ? body.isApproved === true : false;

    const testimonial = await Testimonial.create({ ...body, isApproved });

    if (isAdmin) {
      await logActivity({
        adminId: token.id || 'unknown',
        action: isApproved ? 'TESTIMONIAL_CREATE_APPROVED' : 'TESTIMONIAL_CREATE_PENDING',
        entityType: 'testimonial',
        entityId: testimonial._id.toString(),
        details: { name: testimonial.name, rating: testimonial.rating, isApproved: testimonial.isApproved },
        ip: extractIp(request),
      });
    }

    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
