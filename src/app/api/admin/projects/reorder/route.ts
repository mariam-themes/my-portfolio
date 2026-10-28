import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';

// PUT /api/admin/projects/reorder
// Body: { orderedIds: string[] }  — array of project _id strings in desired order
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { orderedIds } = body as { orderedIds: string[] };

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ success: false, error: 'orderedIds is required' }, { status: 400 });
    }

    // Bulk update: assign saleOrder index to each project
    const ops = orderedIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { saleOrder: index } },
      },
    }));

    await Project.bulkWrite(ops);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error reordering sale projects:', error);
    return NextResponse.json({ success: false, error: 'Failed to reorder projects' }, { status: 500 });
  }
}
