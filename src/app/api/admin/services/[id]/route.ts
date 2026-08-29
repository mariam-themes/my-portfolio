import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Service from '@/models/Service';
import { autoTranslate, isArabic } from '@/lib/translate';
import { logActivity, extractIp } from '@/lib/activity-log';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();

    // Re-run translations if title or description are changed
    if (body.title || body.description) {
      const existingService = await Service.findById(id);
      const titleToTranslate = body.title || existingService?.title || '';
      const descToTranslate = body.description || existingService?.description || '';
      
      const probe = (descToTranslate || titleToTranslate).trim();
      const sourceLang: 'en' | 'ar' = isArabic(probe) ? 'ar' : 'en';
      const target: 'en' | 'ar' = sourceLang === 'ar' ? 'en' : 'ar';

      const tTitle = titleToTranslate ? (await autoTranslate(titleToTranslate))[target] : undefined;
      const tDesc = descToTranslate ? (await autoTranslate(descToTranslate))[target] : undefined;

      const translations: any = {};
      if (tTitle && tTitle !== titleToTranslate) translations.title = tTitle;
      if (tDesc && tDesc !== descToTranslate) translations.description = tDesc;

      if (Object.keys(translations).length > 0) {
        body.sourceLang = sourceLang;
        body.translations = { [target]: translations };
      }
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    await logActivity({
      adminId: session.user?.id || 'unknown',
      action: 'SERVICE_UPDATE',
      entityType: 'service',
      entityId: id,
      details: { title: service.title },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: service }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    await logActivity({
      adminId: session.user?.id || 'unknown',
      action: 'SERVICE_DELETE',
      entityType: 'service',
      entityId: id,
      details: { title: service.title },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete service' },
      { status: 500 }
    );
  }
}
