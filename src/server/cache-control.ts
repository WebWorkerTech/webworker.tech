import type { APIContext } from 'astro'
import { getEnv } from './env'

export function isPublicPage(context: APIContext) {
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    return false
  }

  const url = new URL(context.request.url)
  return (
    url.pathname === '/' ||
    url.pathname === '/episodes' ||
    url.pathname.startsWith('/episode/')
  )
}

export function publicPageCacheControl() {
  return 'public, max-age=60, stale-while-revalidate=300'
}

export function cleanUrlRedirect(context: APIContext) {
  if (!isPublicPage(context)) return null

  const url = new URL(context.request.url)
  if (!url.search) return null

  url.search = ''
  const site = getEnv('PUBLIC_SITE_URL')
  if (site) {
    try {
      const origin = new URL(site)
      url.protocol = origin.protocol
      url.host = origin.host
    } catch {
      // Keep the request URL when PUBLIC_SITE_URL is not a valid URL.
    }
  }

  return Response.redirect(url, 301)
}
