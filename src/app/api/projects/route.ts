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
    const forSaleOnly = searchParams.get('forSale') === 'true';
    const sortAsc = searchParams.get('sort') === 'asc';

    // Build query
    let query: Record<string, unknown> = {};
    if (featuredOnly) query.isFeatured = true;
    if (forSaleOnly) {
      query.isForSale = true;
    } else {
      query.isForSale = { $ne: true };
    }

    // Fetch projects — for-sale uses saleOrder; all projects prioritize custom order
    const projects = await Project.find(query).lean();

    if (forSaleOnly) {
      projects.sort((a: any, b: any) => {
        if (a.saleOrder != null && b.saleOrder != null) return a.saleOrder - b.saleOrder;
        if (a.saleOrder != null) return -1;
        if (b.saleOrder != null) return 1;
        return (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0);
      });
    } else if (sortAsc) {
      projects.sort((a: any, b: any) => (a.year || 0) - (b.year || 0));
    } else {
      projects.sort((a: any, b: any) => {
        if (a.order != null && b.order != null) return a.order - b.order;
        if (a.order != null) return -1;
        if (b.order != null) return 1;
        if (b.year !== a.year) return (b.year || 0) - (a.year || 0);
        return (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0);
      });
    }
    
    // Use cached translations from database instead of calling external API on the fly
    const localizedProjects = projects.map((project) => {
      const trans = project.translations?.[locale] || {};
      
      // If the target locale is the same as the sourceLang, use the original fields,
      // otherwise use the translated fields (fallback to original if missing).
      // Also treat projects as target source if they have translations in the target locale,
      // even if sourceLang is not explicitly set (legacy projects).
      const hasTargetTranslation = project.translations?.[locale];
      const isTargetSource = project.sourceLang === locale || (!project.sourceLang && !!hasTargetTranslation);
      
      return {
        ...project,
        title: isTargetSource ? project.title : (trans.title || project.title),
        description: isTargetSource ? project.description : (trans.description || project.description),
        category: isTargetSource ? project.category : (trans.category || project.category),
        sector: isTargetSource ? project.sector : (trans.sector || project.sector),
        rawCategory: project.category,
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
