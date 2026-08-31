import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    const cookieStore = await cookies();
    let locale = cookieStore.get('NEXT_LOCALE')?.value as 'en' | 'ar' | undefined;
    if (!locale) locale = 'en';

    const raw = await Project.findOne({ slug }).lean() as any;
    if (!raw) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const trans = raw.translations?.[locale] || {};
    const isTargetSource = raw.sourceLang === locale;

    const project = {
      ...raw,
      _id: String(raw._id),
      title: isTargetSource ? raw.title : (trans.title || raw.title),
      description: isTargetSource ? raw.description : (trans.description || raw.description),
      sector: isTargetSource ? raw.sector : (trans.sector || raw.sector),
      services: isTargetSource ? raw.services : (trans.services || raw.services),
      tools: isTargetSource ? raw.tools : (trans.tools || raw.tools),
    };

    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch project' }, { status: 500 });
  }
}
