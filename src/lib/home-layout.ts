import connectToDatabase from '@/lib/mongodb';
import { SectionLayout } from '@/models/SectionLayout';
import {
  HOME_SECTIONS,
  type HomeSection,
  type HomeSectionId,
} from '@/lib/home-sections';

export interface ResolvedHomeSection extends HomeSection {
  id: HomeSectionId;
  isVisible: boolean;
  content: Record<string, unknown> | null;
}

/**
 * Resolves the homepage layout: the code registry (fixed order + components)
 * merged with the DB visibility flags. Returns every registered section in
 * code order, each flagged with whether it should render.
 */
export async function getHomeLayout(): Promise<ResolvedHomeSection[]> {
  let dbMap = new Map<string, { isVisible: boolean; content?: unknown }>();

  try {
    await connectToDatabase();
    const layout = await SectionLayout.findOne({ key: 'home' }).lean();
    if (layout?.sections) {
      for (const s of layout.sections as Array<{
        id: string;
        isVisible: boolean;
        content?: unknown;
      }>) {
        dbMap.set(s.id, { isVisible: s.isVisible, content: s.content });
      }
    }
  } catch (error) {
    // If the DB is unavailable (e.g. during build), fall back to defaults so
    // the homepage still renders its registered sections.
    console.error('getHomeLayout: DB read failed, using defaults.', error);
  }

  return HOME_SECTIONS.map((sec) => {
    const db = dbMap.get(sec.id);
    return {
      ...sec,
      isVisible: db?.isVisible ?? sec.defaultVisible,
      content: (db?.content as Record<string, unknown>) ?? null,
    };
  });
}

/** Returns only the sections that should render on the homepage. */
export async function getVisibleHomeSections() {
  const layout = await getHomeLayout();
  return layout.filter((s) => s.isVisible);
}
