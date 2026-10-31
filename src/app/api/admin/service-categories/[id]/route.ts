import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import ServiceCategory from '@/models/ServiceCategory';
import Service from '@/models/Service';
import { logActivity, extractIp } from '@/lib/activity-log';
import { translateCategoryName } from '@/lib/translate';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const rawName: string = (body.name || '').trim();

    if (!rawName) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const existingCategory = await ServiceCategory.findById(id);
    if (!existingCategory) {
      return NextResponse.json({ success: false, error: 'Service category not found' }, { status: 404 });
    }

    const oldName = existingCategory.name;

    // Auto-translate the updated name
    const { en: nameEn, ar: nameAr } = await translateCategoryName(rawName);

    const category = await ServiceCategory.findByIdAndUpdate(
      id,
      { name: rawName, nameEn, nameAr },
      { new: true }
    );

    // If the category name changed, also update services referencing the old name
    if (oldName !== rawName) {
      await Service.updateMany(
        { category: oldName },
        { $set: { category: rawName } }
      );
    }

    await logActivity({
      adminId: session.user?.id || 'unknown',
      action: 'SERVICE_CATEGORY_UPDATE',
      entityType: 'serviceCategory',
      entityId: id,
      details: { oldName, newName: rawName },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating service category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const category = await ServiceCategory.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json({ success: false, error: 'Service category not found' }, { status: 404 });
    }

    // Clear this category from all services that reference it.
    // Services are NEVER deleted — they just become uncategorized.
    await Service.updateMany(
      { category: category.name },
      { $unset: { category: '' } }
    );

    await logActivity({
      adminId: session.user?.id || 'unknown',
      action: 'SERVICE_CATEGORY_DELETE',
      entityType: 'serviceCategory',
      entityId: id,
      details: { name: category.name },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting service category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete service category' },
      { status: 500 }
    );
  }
}

