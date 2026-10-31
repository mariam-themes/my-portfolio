import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import ServiceCategory from '@/models/ServiceCategory';
import { logActivity, extractIp } from '@/lib/activity-log';
import { translateCategoryName } from '@/lib/translate';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Sort alphabetically by name
    const categories = await ServiceCategory.find({}).sort({ name: 1 });
    
    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    const rawName: string = (body.name || '').trim();

    if (!rawName) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    // Smart translation for short category labels
    const { en: nameEn, ar: nameAr } = await translateCategoryName(rawName);

    const category = await ServiceCategory.create({ name: rawName, nameEn, nameAr });

    await logActivity({
      adminId: session.user?.id || 'unknown',
      action: 'SERVICE_CATEGORY_CREATE',
      entityType: 'serviceCategory',
      entityId: category._id.toString(),
      details: { name: rawName, nameEn, nameAr },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service category:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Service category already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create service category' },
      { status: 500 }
    );
  }
}

