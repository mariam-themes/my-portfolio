import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Project from '@/models/Project';
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

    // Auto-translate the updated name
    const { en: nameEn, ar: nameAr } = await translateCategoryName(rawName);

    const category = await Category.findByIdAndUpdate(
      id,
      { name: rawName, nameEn, nameAr },
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    await logActivity({
      adminId: session.user?.id || 'unknown',
      action: 'CATEGORY_UPDATE',
      entityType: 'category',
      entityId: id,
      details: { name: rawName },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
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

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Clear this category name from all projects that reference it
    // Projects are NOT deleted — they just become uncategorised.
    await Project.updateMany(
      { category: category.name },
      { $unset: { category: '' } }
    );
    // Also handle legacy projects that used "sector" instead of "category"
    await Project.updateMany(
      { sector: category.name },
      { $unset: { sector: '' } }
    );

    await logActivity({
      adminId: session.user?.id || 'unknown',
      action: 'CATEGORY_DELETE',
      entityType: 'category',
      entityId: id,
      details: { name: category.name },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
