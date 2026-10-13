import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import cloudinary from '@/lib/cloudinary';

export async function GET(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const usage = await (cloudinary.api as any).usage();

    // Cloudinary free plan: 25 GB storage, 25 GB bandwidth, 25 credits/month
    const FREE_STORAGE_BYTES   = 25 * 1024 * 1024 * 1024;
    const FREE_BANDWIDTH_BYTES = 25 * 1024 * 1024 * 1024;

    const storageBytes    = usage.storage?.usage    || 0;
    const storageLimBytes = FREE_STORAGE_BYTES;
    const bandwidthBytes  = usage.bandwidth?.usage  || 0;
    const bandwidthLimB   = FREE_BANDWIDTH_BYTES;

    const toGB  = (b: number) => +(b / 1024 / 1024 / 1024).toFixed(2);
    const toMB  = (b: number) => Math.round(b / 1024 / 1024);
    const pct   = (used: number, lim: number) => +((used / lim) * 100).toFixed(2);

    return NextResponse.json({
      success: true,
      data: {
        storage: {
          usedMB:  toMB(storageBytes),
          usedGB:  toGB(storageBytes),
          limitGB: toGB(storageLimBytes),
          pct:     pct(storageBytes, storageLimBytes),
        },
        bandwidth: {
          usedMB:  toMB(bandwidthBytes),
          usedGB:  toGB(bandwidthBytes),
          limitGB: toGB(bandwidthLimB),
          pct:     pct(bandwidthBytes, bandwidthLimB),
        },
        resources: {
          total:                usage.resources          ?? 0,
          transformations:      usage.transformations?.usage  ?? 0,
          transformationsLimit: usage.transformations?.limit  ?? 25000,
        },
        credits: {
          used:       +(usage.credits?.usage        ?? 0).toFixed(2),
          limit:      usage.credits?.limit          ?? 25,
          usedPercent:+(usage.credits?.used_percent ?? 0).toFixed(1),
        },
        plan:        usage.plan ?? 'Free',
        lastUpdated: usage.last_updated ?? null,
        // Cloudinary free plan video size limit
        videoMaxMB: Math.round((usage.media_limits?.video_max_size_bytes ?? 104857600) / 1024 / 1024),
      },
    });

  } catch (err: any) {
    console.error('[cloudinary-usage] ❌', err?.message);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch Cloudinary usage' },
      { status: 500 }
    );
  }
}
