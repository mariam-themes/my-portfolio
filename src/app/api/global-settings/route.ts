import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import GlobalSettings, {
  DEFAULT_GLOBAL_SETTINGS,
} from '@/models/GlobalSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    let doc = await GlobalSettings.findOne().lean();
    if (!doc) {
      const created = await GlobalSettings.create({});
      doc = created.toObject();
    }
    const data = { ...DEFAULT_GLOBAL_SETTINGS, ...doc };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch settings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (typeof body.siteName === 'string') update.siteName = body.siteName;
    if (typeof body.logoUrl === 'string') update.logoUrl = body.logoUrl;
    if (typeof body.email === 'string') update.email = body.email;
    if (typeof body.whatsapp === 'string') update.whatsapp = body.whatsapp;
    if (typeof body.copyright === 'string') update.copyright = body.copyright;

    if (Array.isArray(body.socials)) {
      update.socials = body.socials.map((s: { platform?: string; url?: string; label?: string }) => ({
        platform: String(s?.platform || ''),
        url: String(s?.url || ''),
        label: String(s?.label || ''),
      }));
    }

    if (Array.isArray(body.usefulLinks)) {
      update.usefulLinks = body.usefulLinks.map((l: { label?: string; url?: string }) => ({
        label: String(l?.label || ''),
        url: String(l?.url || ''),
      }));
    }

    const updated = await GlobalSettings.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save settings';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
