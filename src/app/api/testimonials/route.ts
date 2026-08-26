import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongodb';
import { Testimonial } from '@/models/Testimonial';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';
    
    const query = isPublic ? { isApproved: true } : {};
    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 }).lean();

    // Testimonials are user-generated and must keep the language they were
    // written in — we never auto-translate a review (an Arabic review stays
    // Arabic even when the site UI is switched to English). We only strip the
    // email from public responses to protect privacy.
    const localizedTestimonials = testimonials.map((testimonial) => {
      const t = { ...testimonial };
      if (isPublic && (t as any).email) {
        delete (t as any).email;
      }
      return t;
    });

    return NextResponse.json({ success: true, data: localizedTestimonials });
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
    const token = await getToken({ req: request as never });
    const isAdmin = !!token;
    const isApproved = isAdmin ? body.isApproved === true : false;

    const testimonial = await Testimonial.create({ ...body, isApproved });
    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
