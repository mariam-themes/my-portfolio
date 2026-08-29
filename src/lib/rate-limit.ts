import connectToDatabase from '@/lib/mongodb';
import { RateLimit } from '@/models/RateLimit';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  await connectToDatabase();

  const now = Date.now();
  const windowStart = now - windowMs;

  const result = await RateLimit.findOneAndUpdate(
    { key },
    {
      $inc: { count: 1 },
      $setOnInsert: { key, count: 1, resetAt: now + windowMs },
      $max: { resetAt: now + windowMs },
    },
    { upsert: true, new: true }
  ).lean();

  await RateLimit.deleteMany({ updatedAt: { $lt: windowStart } });

  const currentCount = result?.count ?? 0;
  const remaining = Math.max(0, maxAttempts - currentCount);
  const resetTime = result?.resetAt ?? now + windowMs;

  return {
    allowed: currentCount <= maxAttempts,
    remaining,
    resetTime,
    limit: maxAttempts,
  };
}

export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  };
}