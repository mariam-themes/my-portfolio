import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongodb';
import AboutMe, { DEFAULT_ABOUT_ME } from '@/models/AboutMe';
import { autoTranslate, isArabic, translateHtmlContent } from '@/lib/translate';
import { logActivity, extractIp } from '@/lib/activity-log';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || 'ar';

    let doc = await AboutMe.findOne();
    if (!doc) {
      doc = await AboutMe.create({});
    }

    let hasChanged = false;

    // Determine the source language if not set
    if (!doc.sourceLang) {
      doc.sourceLang = isArabic(doc.bio || '') ? 'ar' : 'en';
      hasChanged = true;
    }

    const target: 'en' | 'ar' = doc.sourceLang === 'ar' ? 'en' : 'ar';

    // If translations for the target language are completely missing, pre-populate them
    if (!doc.translations || !doc.translations[target]) {
      const tBio = doc.bio ? await translateHtmlContent(doc.bio, target) : '';

      const tSkills = [];
      if (Array.isArray(doc.skills)) {
        for (const skill of doc.skills) {
          const translated = (await autoTranslate(skill))[target];
          tSkills.push(translated);
        }
      }

      const tExperience = [];
      if (Array.isArray(doc.experience)) {
        for (const exp of doc.experience) {
          const tRole = exp.role ? (await autoTranslate(exp.role))[target] : '';
          const tCompany = exp.company ? (await autoTranslate(exp.company))[target] : '';
          const tDuration = exp.duration ? (await autoTranslate(exp.duration))[target] : '';
          const tDesc = exp.description ? (await autoTranslate(exp.description))[target] : '';
          tExperience.push({
            role: tRole,
            company: tCompany,
            duration: tDuration,
            description: tDesc,
          });
        }
      }

      const currentTranslations = doc.translations ? doc.toObject().translations : {};
      doc.translations = {
        ...currentTranslations,
        [target]: {
          bio: tBio,
          skills: tSkills,
          experience: tExperience,
        }
      };

      hasChanged = true;
    }

    if (hasChanged) {
      await doc.save();
    }

    const docObj = doc.toObject();

    // Localize the returned values
    const returnedData = { ...DEFAULT_ABOUT_ME, ...docObj };

    const tSet = docObj.translations?.[locale as 'en' | 'ar'];
    if (locale !== docObj.sourceLang && tSet) {
      if (tSet.bio) returnedData.bio = tSet.bio;
      if (tSet.skills && tSet.skills.length > 0) returnedData.skills = tSet.skills;
      if (tSet.experience && tSet.experience.length > 0) returnedData.experience = tSet.experience;
    }

    return NextResponse.json({ success: true, data: returnedData });
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
    const update: Record<string, any> = {};

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

    // Auto-translate fields
    const sourceLang: 'en' | 'ar' = isArabic(body.bio || '') ? 'ar' : 'en';
    const target: 'en' | 'ar' = sourceLang === 'ar' ? 'en' : 'ar';

    const tBio = body.bio ? await translateHtmlContent(body.bio, target) : '';

    const tSkills = [];
    if (Array.isArray(body.skills)) {
      for (const skill of body.skills) {
        const translated = (await autoTranslate(skill))[target];
        tSkills.push(translated);
      }
    }

    const tExperience = [];
    if (Array.isArray(body.experience)) {
      for (const exp of body.experience) {
        const tRole = exp.role ? (await autoTranslate(exp.role))[target] : '';
        const tCompany = exp.company ? (await autoTranslate(exp.company))[target] : '';
        const tDuration = exp.duration ? (await autoTranslate(exp.duration))[target] : '';
        const tDesc = exp.description ? (await autoTranslate(exp.description))[target] : '';
        tExperience.push({
          role: tRole,
          company: tCompany,
          duration: tDuration,
          description: tDesc,
        });
      }
    }

    update.sourceLang = sourceLang;
    update.translations = {
      [target]: {
        bio: tBio,
        skills: tSkills,
        experience: tExperience,
      }
    };

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
