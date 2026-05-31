import { defineMiddleware } from 'astro:middleware'
import {
  cleanUrlRedirect,
  isPublicPage,
  publicPageCacheControl,
} from '@/server/cache-control'
import { enforceRateLimit } from '@/server/rate-limit'
import { applySecurityHeaders } from '@/server/security'
import { startRssScheduler } from '@/server/scheduler'

export const onRequest = defineMiddleware(async (context, next) => {
  startRssScheduler()

  const redirect = cleanUrlRedirect(context)
  if (redirect) return redirect

  if (isPublicPage(context)) {
    const limited = await enforceRateLimit(context, {
      scope: 'public-page',
      limit: 240,
      windowSeconds: 60,
    })
    if (limited) return limited
  }

  const response = await next()
  applySecurityHeaders(response)

  if (isPublicPage(context) && !response.headers.has('Cache-Control')) {
    response.headers.set('Cache-Control', publicPageCacheControl())
  }

  if (process.env.PUBLIC_ALLOW_INDEXING !== 'true') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  }

  return response
})
