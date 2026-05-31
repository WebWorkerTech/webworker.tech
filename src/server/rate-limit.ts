import type { APIContext } from 'astro'
import { incrementFixedWindow } from './redis'

interface RateLimitOptions {
  key: string
  limit: number
  windowSeconds: number
}

interface MemoryBucket {
  count: number
  resetAt: number
}

const memoryBuckets = new Map<string, MemoryBucket>()

function cleanKey(value: string) {
  return value.replace(/[^a-zA-Z0-9:._-]/g, '_').slice(0, 180)
}

export function getClientIp(context: APIContext) {
  const headers = context.request.headers
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    forwarded ||
    context.clientAddress ||
    'unknown'
  )
}

function memoryIncrement(key: string, windowSeconds: number) {
  const now = Date.now()
  const bucket = memoryBuckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000
    memoryBuckets.set(key, { count: 1, resetAt })
    return { count: 1, resetSeconds: windowSeconds }
  }

  bucket.count += 1
  return {
    count: bucket.count,
    resetSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  }
}

export async function checkRateLimit(options: RateLimitOptions) {
  const key = `webworker:rate:${cleanKey(options.key)}`
  const result =
    (await incrementFixedWindow(key, options.windowSeconds).catch(() => null)) ||
    memoryIncrement(key, options.windowSeconds)

  return {
    ok: result.count <= options.limit,
    limit: options.limit,
    remaining: Math.max(0, options.limit - result.count),
    resetSeconds: result.resetSeconds,
  }
}

export function rateLimitResponse(resetSeconds: number) {
  return Response.json(
    { error: 'Too many requests' },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(resetSeconds),
      },
    },
  )
}

export async function enforceRateLimit(
  context: APIContext,
  options: Omit<RateLimitOptions, 'key'> & { scope: string },
) {
  const ip = getClientIp(context)
  const result = await checkRateLimit({
    key: `${options.scope}:${ip}`,
    limit: options.limit,
    windowSeconds: options.windowSeconds,
  })

  if (result.ok) return null
  return rateLimitResponse(result.resetSeconds)
}
