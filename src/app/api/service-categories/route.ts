import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ServiceCategory from '@/models/ServiceCategory';
import Service from '@/models/Service';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const onlyWithServices = searchParams.get('active') !== 'false';

    const categories = await ServiceCategory.find({}).sort({ name: 1 }).lean();

    if (!onlyWithServices) {
      return NextResponse.json({ success: true, data: categories }, { status: 200 });
    }

    // Get unique categories that currently have at least one service
    const serviceCategoryNames = await Service.distinct('category', {
      category: { $exists: true, $ne: '' }
    });
    const activeNamesSet = new Set(serviceCategoryNames.map((n: string) => n.trim().toLowerCase()));

    const activeCategories = categories.filter((c: any) =>
      activeNamesSet.has((c.name || '').trim().toLowerCase())
    );

    return NextResponse.json({ success: true, data: activeCategories }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching public service categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service categories' },
      { status: 500 }
    );
  }
}

