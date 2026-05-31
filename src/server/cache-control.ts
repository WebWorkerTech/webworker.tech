import type { APIContext } from 'astro'

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
  return Response.redirect(url, 301)
}
