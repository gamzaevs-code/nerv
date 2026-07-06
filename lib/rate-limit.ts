import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const limiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m'), analytics: true }) : null;
const memory = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(key: string) {
  if (limiter) {
    const result = await limiter.limit(key);
    return { success: result.success, reset: result.reset };
  }

  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const item = memory.get(key);
  if (!item || item.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, reset: now + windowMs };
  }
  item.count += 1;
  return { success: item.count <= 5, reset: item.resetAt };
}

export function getClientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function enforceRateLimit(request: Request, scope: string, identifier?: string) {
  const ip = getClientIp(request);
  const key = `nerv:${scope}:${identifier || ip}`;
  const result = await checkRateLimit(key);
  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Слишком много попыток. Попробуйте позже.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
