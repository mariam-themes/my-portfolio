import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import cloudinary from '@/lib/cloudinary';
import { logActivity, extractIp } from '@/lib/activity-log';
import {
  ALLOWED_FOLDERS,
  MAX_VIDEO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  isAllowedFolder,
  getHumanMediaType,
} from '@/lib/upload-constants';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate admin user
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: login required' }, { status: 401 });
    }

    if (token.role && token.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: admin privilege required' }, { status: 403 });
    }

    // 2. Parse payload
    const body = await request.json().catch(() => ({}));
    const publicId = typeof body.publicId === 'string' ? body.publicId.trim() : '';
    const expectedFolder = typeof body.expectedFolder === 'string' ? body.expectedFolder.trim() : '';
    const resourceTypeParam = (body.resourceType || 'auto') as 'image' | 'video' | 'raw' | 'auto';
    const filename = typeof body.filename === 'string' ? body.filename.trim() : '';

    if (!publicId) {
      return NextResponse.json({ success: false, error: 'Missing publicId' }, { status: 400 });
    }

    if (!expectedFolder || !isAllowedFolder(expectedFolder)) {
      return NextResponse.json(
        { success: false, error: `Invalid or unpermitted folder "${expectedFolder}"` },
        { status: 400 }
      );
    }

    // Verify publicId folder boundary to prevent cross-folder tampering
    if (!publicId.startsWith(`${expectedFolder}/`)) {
      return NextResponse.json(
        { success: false, error: `publicId "${publicId}" does not match target folder "${expectedFolder}"` },
        { status: 400 }
      );
    }

    // 3. Query Cloudinary Admin API to verify the asset actually exists and was created in our account
    let asset: any;
    try {
      asset = await (cloudinary.api as any).resource(publicId, {
        resource_type: resourceTypeParam === 'auto' ? 'image' : resourceTypeParam,
      });
    } catch {
      // If querying as image failed and resourceType was auto, try video
      if (resourceTypeParam === 'auto') {
        try {
          asset = await (cloudinary.api as any).resource(publicId, {
            resource_type: 'video',
          });
        } catch {
          // Try raw as last resort
          try {
            asset = await (cloudinary.api as any).resource(publicId, {
              resource_type: 'raw',
            });
          } catch (finalErr: any) {
            console.error('[upload/verify] Asset not found on Cloudinary:', publicId, finalErr?.message);
            return NextResponse.json(
              { success: false, error: 'Asset could not be verified on Cloudinary.' },
              { status: 404 }
            );
          }
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Asset could not be verified on Cloudinary.' },
          { status: 404 }
        );
      }
    }

    if (!asset || !asset.public_id || !asset.secure_url) {
      return NextResponse.json(
        { success: false, error: 'Asset validation failed: missing essential Cloudinary metadata.' },
        { status: 400 }
      );
    }

    // 4. Validate asset size and limits server-side
    const assetBytes = asset.bytes || 0;
    const actualResourceType = asset.resource_type as 'image' | 'video' | 'raw';

    if (actualResourceType === 'video' && assetBytes > MAX_VIDEO_SIZE_BYTES) {
      // Destroy oversized asset
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' }).catch(() => {});
      return NextResponse.json(
        { success: false, error: `Uploaded video exceeds the maximum limit of ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)} MB.` },
        { status: 400 }
      );
    }

    if (actualResourceType === 'image' && assetBytes > MAX_IMAGE_SIZE_BYTES) {
      // Destroy oversized asset
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(() => {});
      return NextResponse.json(
        { success: false, error: `Uploaded image exceeds the maximum limit of ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB.` },
        { status: 400 }
      );
    }

    // 5. Verify secure_url origin
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (cloudName && !asset.secure_url.includes(`res.cloudinary.com/${cloudName}`)) {
      return NextResponse.json(
        { success: false, error: 'Asset URL does not match authorized Cloudinary account domain.' },
        { status: 400 }
      );
    }

    // 6. Record activity in MongoDB ActivityLog
    const adminId = (token.id as string) || (token.sub as string) || (token.email as string) || 'admin';
    await logActivity({
      adminId,
      action: 'MEDIA_UPLOAD',
      entityType: 'media',
      entityId: asset.public_id,
      details: {
        filename: filename || asset.filename || asset.public_id,
        mimeType: `${actualResourceType}/${asset.format || ''}`,
        sizeBytes: assetBytes,
        folder: expectedFolder,
        resourceType: actualResourceType,
        cloudinaryUrl: asset.secure_url,
        verified: true,
      },
      ip: extractIp(request),
    });

    // 7. Determine human media type
    const mediaType = getHumanMediaType(`${actualResourceType}/${asset.format || ''}`);

    return NextResponse.json({
      success: true,
      data: {
        secure_url: asset.secure_url,
        public_id: asset.public_id,
        resource_type: actualResourceType,
        format: asset.format,
        bytes: assetBytes,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        mediaType,
      },
    });

  } catch (error: any) {
    console.error('[upload/verify] Verification failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to verify upload' },
      { status: 500 }
    );
  }
}
