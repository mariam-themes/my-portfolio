import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import { Inquiry } from '@/models/Inquiry';
import type { InquiryStatus } from '@/models/Inquiry';
import { logActivity, extractIp } from '@/lib/activity-log';

const VALID_STATUSES: InquiryStatus[] = ['new', 'contacted', 'closed'];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    await connectToDatabase();

    const body = await request.json();

    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Use: new, contacted, closed' },
        { status: 400 }
      );
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 });
    }

    const oldStatus = inquiry.status;
    inquiry.status = body.status;
    await inquiry.save();

    await logActivity({
      adminId: session.user?.id || 'unknown',
      action: 'INQUIRY_STATUS_UPDATE',
      entityType: 'inquiry',
      entityId: id,
      details: { fromStatus: oldStatus, toStatus: body.status, name: inquiry.name, email: inquiry.email },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: inquiry }, { status: 200 });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    await connectToDatabase();

    const deletedInquiry = await Inquiry.findByIdAndDelete(id);
    if (!deletedInquiry) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 });
    }

    await logActivity({
      adminId: session.user?.id || 'unknown',
      action: 'INQUIRY_DELETE',
      entityType: 'inquiry',
      entityId: id,
      details: { name: deletedInquiry.name, email: deletedInquiry.email, service: deletedInquiry.service },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, message: 'Inquiry deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}