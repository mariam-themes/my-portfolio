import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Service from '@/models/Service';
import { autoTranslate, isArabic } from '@/lib/translate';
import { logActivity, extractIp } from '@/lib/activity-log';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Sort by order ascending
    const services = await Service.find({}).sort({ order: 1, createdAt: -1 });
    
    return NextResponse.json({ success: true, data: services }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching admin services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
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

    // Auto-translate fields
    const probe = (body.description || body.title || '').trim();
    const sourceLang: 'en' | 'ar' = isArabic(probe) ? 'ar' : 'en';
    const target: 'en' | 'ar' = sourceLang === 'ar' ? 'en' : 'ar';

    const tTitle = body.title ? (await autoTranslate(body.title))[target] : undefined;
    const tDesc = body.description ? (await autoTranslate(body.description))[target] : undefined;

    const translations: any = {};
    if (tTitle && tTitle !== body.title) translations.title = tTitle;
    if (tDesc && tDesc !== body.description) translations.description = tDesc;

    if (Object.keys(translations).length > 0) {
      body.sourceLang = sourceLang;
      body.translations = { [target]: translations };
    }

    const service = await Service.create(body);

    await logActivity({
      adminId: session.user?.id || 'unknown',
      action: 'SERVICE_CREATE',
      entityType: 'service',
      entityId: service._id.toString(),
      details: { title: service.title },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error: any) {
    console.error('=== SERVICE CREATE ERROR ===');
    console.error('Error message:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((err: any) => err.message);
      return NextResponse.json({ success: false, error: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
}
