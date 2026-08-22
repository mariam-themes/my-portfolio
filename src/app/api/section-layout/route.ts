import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SectionLayout } from '@/models/SectionLayout';
import { HOME_SECTIONS_DATA } from '@/lib/home-sections-data';

export const dynamic = 'force-dynamic';

/**
 * Public homepage layout — returns the homepage sections in their FIXED
 * code-defined order, each flagged with the DB visibility setting.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const layout = await SectionLayout.findOne({ key: 'home' }).lean();
    const dbMap = new Map<string, { isVisible: boolean; content?: unknown }>();
    if (layout?.sections) {
      for (const s of layout.sections as Array<{
        id: string;
        isVisible: boolean;
        content?: unknown;
      }>) {
        dbMap.set(s.id, { isVisible: s.isVisible, content: s.content });
      }
    }

    const sections = HOME_SECTIONS_DATA.map((sec) => ({
      id: sec.id,
      labelKey: sec.labelKey,
      isVisible: dbMap.get(sec.id)?.isVisible ?? sec.defaultVisible,
      content: dbMap.get(sec.id)?.content ?? null,
    }));

    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch layout';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
