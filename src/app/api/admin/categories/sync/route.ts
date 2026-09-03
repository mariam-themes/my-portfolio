import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Project from '@/models/Project';

/**
 * POST /api/admin/categories/sync
 * Clears category/sector fields from projects that reference a category
 * name that no longer exists in the Category collection.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get all valid category names
    const validCategories = await Category.find({}).select('name').lean();
    const validNames = validCategories.map((c: any) => c.name);

    // Unset category from projects whose category is not in the valid set
    const catResult = await Project.updateMany(
      { category: { $exists: true, $nin: ['', null, ...validNames] } },
      { $unset: { category: '' } }
    );

    // Same for legacy "sector" field
    const secResult = await Project.updateMany(
      { sector: { $exists: true, $nin: ['', null, ...validNames] } },
      { $unset: { sector: '' } }
    );

    return NextResponse.json({
      success: true,
      validCategories: validNames,
      projectsCleaned: catResult.modifiedCount + secResult.modifiedCount,
    });
  } catch (error: any) {
    console.error('Error syncing categories:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
