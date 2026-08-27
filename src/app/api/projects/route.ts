import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';

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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get('featured') === 'true';
    const sortAsc = searchParams.get('sort') === 'asc';

    // Build query — if ?featured=true only return isFeatured projects
    const query = featuredOnly ? { isFeatured: true } : {};

    // Fetch projects — default newest-first; ?sort=asc for oldest-first (date order)
    const projects = await Project.find(query)
      .sort(sortAsc ? { year: 1, createdAt: 1 } : { year: -1, createdAt: -1 })
      .lean();
    
    // Use cached translations from database instead of calling external API on the fly
    const localizedProjects = projects.map((project) => {
      const trans = project.translations?.[locale] || {};
      
      // If the target locale is the same as the sourceLang, use the original fields,
      // otherwise use the translated fields (fallback to original if missing).
      const isTargetSource = project.sourceLang === locale;
      
      return {
        ...project,
        title: isTargetSource ? project.title : (trans.title || project.title),
        description: isTargetSource ? project.description : (trans.description || project.description),
      };
    });
    
    return NextResponse.json({ success: true, data: localizedProjects }, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
