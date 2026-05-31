import type { APIContext } from 'astro'
import { getEnv } from './env'

export function publicOrigin(context: APIContext) {
  const headers = context.request.headers
  const url = new URL(context.request.url)
  const host = headers.get('x-forwarded-host') || headers.get('host') || url.host
  const proto =
    headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    url.protocol.replace(':', '')
  return `${proto}://${host}`
}

export function configuredSiteOrigin() {
  const site = getEnv('PUBLIC_SITE_URL')
  if (!site) return ''

  try {
    return new URL(site).origin
  } catch {
    return ''
  }
}

export function isTrustedWriteOrigin(context: APIContext) {
  const headers = context.request.headers
  const origin = headers.get('origin')
  const referer = headers.get('referer')
  const source = origin || referer
  if (!source) return false

  let sourceOrigin = ''
  try {
    sourceOrigin = new URL(source).origin
  } catch {
    return false
  }

  const allowed = new Set(
    [publicOrigin(context), configuredSiteOrigin()].filter(Boolean),
  )
  return allowed.has(sourceOrigin)
}

export function forbiddenOrigin() {
  return Response.json(
    { error: 'Forbidden origin' },
    {
      status: 403,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}

export function applySecurityHeaders(response: Response) {
  const headers = response.headers
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('X-Frame-Options', 'SAMEORIGIN')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (configuredSiteOrigin().startsWith('https://')) {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    )
  }

  if (!headers.has('Content-Security-Policy')) {
    headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' https: data:",
        "media-src 'self' https:",
        "connect-src 'self'",
        "font-src 'self' data:",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    )
  }
}
