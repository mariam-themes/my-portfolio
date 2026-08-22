import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import { Testimonial } from '@/models/Testimonial';
import { localizeText } from '@/lib/translate';

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
    
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 }).lean();
    
    // Translate fields on the fly
    const localizedTestimonials = await Promise.all(
      testimonials.map(async (testimonial) => {
        return {
          ...testimonial,
          content: await localizeText(testimonial.content, locale),
          role: await localizeText(testimonial.role, locale),
          company: testimonial.company ? await localizeText(testimonial.company, locale) : testimonial.company,
        };
      })
    );
    
    return NextResponse.json({ success: true, data: localizedTestimonials });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const testimonial = await Testimonial.create(body);
    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
