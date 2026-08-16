import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SectionLayout } from '@/models/SectionLayout';
import { HOME_SECTIONS } from '@/lib/home-sections';

/**
 * Admin homepage layout manager.
 * - GET: registry sections merged with DB visibility (for the toggle UI).
 * - PUT: upserts per-section visibility (and optional content). Order is
 *   never stored — it is defined by the code registry.
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

    const sections = HOME_SECTIONS.map((sec) => ({
      id: sec.id,
      labelKey: sec.labelKey,
      isVisible: dbMap.get(sec.id)?.isVisible ?? sec.defaultVisible,
      content: dbMap.get(sec.id)?.content ?? null,
    }));

    return NextResponse.json({ success: true, data: sections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const incoming: Array<{ id: string; isVisible: boolean; content?: unknown }> =
      Array.isArray(body.sections) ? body.sections : [];

    // Only accept ids that exist in the code registry (flexible, no orphans).
    const registryIds = new Set(HOME_SECTIONS.map((s) => s.id));
    const sections = incoming
      .filter((s) => s && registryIds.has(s.id))
      .map((s) => ({
        id: s.id,
        isVisible: typeof s.isVisible === 'boolean' ? s.isVisible : true,
        ...(s.content !== undefined ? { content: s.content } : {}),
      }));

    await SectionLayout.findOneAndUpdate(
      { key: 'home' },
      { $set: { key: 'home', sections } },
      { upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: sections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
