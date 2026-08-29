import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongodb';
import AboutMe, { DEFAULT_ABOUT_ME } from '@/models/AboutMe';
import { logActivity, extractIp } from '@/lib/activity-log';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    let doc = await AboutMe.findOne().lean();
    if (!doc) {
      const created = await AboutMe.create({});
      doc = created.toObject();
    }
    const data = { ...DEFAULT_ABOUT_ME, ...doc };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch about me data';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const token = await getToken({ req: request as any });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (typeof body.bio === 'string') update.bio = body.bio;
    if (typeof body.photo === 'string') update.photo = body.photo;
    if (Array.isArray(body.skills)) update.skills = body.skills;
    if (typeof body.cvLink === 'string') update.cvLink = body.cvLink;

    if (Array.isArray(body.experience)) {
      update.experience = body.experience.map(
        (exp: {
          role?: string;
          company?: string;
          duration?: string;
          description?: string;
        }) => ({
          role: String(exp?.role || ''),
          company: String(exp?.company || ''),
          duration: String(exp?.duration || ''),
          description: String(exp?.description || ''),
        })
      );
    }

    const updated = await AboutMe.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
    });

    await logActivity({
      adminId: token.id || 'unknown',
      action: 'ABOUT_ME_UPDATE',
      entityType: 'about_me',
      details: { 
        bioUpdated: !!body.bio,
        photoUpdated: !!body.photo,
        skillsUpdated: Array.isArray(body.skills),
        cvLinkUpdated: !!body.cvLink,
        experienceUpdated: Array.isArray(body.experience),
      },
      ip: extractIp(request),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save about me data';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
