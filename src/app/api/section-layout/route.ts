import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SectionLayout } from '@/models/SectionLayout';
import { HOME_SECTIONS } from '@/lib/home-sections';

export const dynamic = 'force-dynamic';

/**
 * Public homepage layout — returns the homepage sections in their FIXED
 * code-defined order, each flagged with the DB visibility setting.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const layout = await SectionLayout.findOne({ key: 'home' }).lean();
    const dbMap = new Map<string, boolean>();
    if (layout?.sections) {
      for (const s of layout.sections as Array<{ id: string; isVisible: boolean }>) {
        dbMap.set(s.id, s.isVisible);
      }
    }

    const sections = HOME_SECTIONS.map((sec) => ({
      id: sec.id,
      labelKey: sec.labelKey,
      isVisible: dbMap.get(sec.id) ?? sec.defaultVisible,
    }));

    return NextResponse.json({ success: true, data: sections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
