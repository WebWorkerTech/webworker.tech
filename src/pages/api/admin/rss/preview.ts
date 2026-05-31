import type { APIRoute } from 'astro'
import { adminJson, getAdminFromContext, unauthorized } from '@/server/auth'
import { enforceRateLimit } from '@/server/rate-limit'
import { diffRemoteEpisodesByTitle } from '@/server/rss'

export const GET: APIRoute = async (context) => {
  const limited = await enforceRateLimit(context, {
    scope: 'rss-preview',
    limit: 30,
    windowSeconds: 300,
  })
  if (limited) return limited

  const admin = await getAdminFromContext(context)
  if (!admin) return unauthorized()

  const episodes = await diffRemoteEpisodesByTitle()
  return adminJson({
    episodes: episodes.map((episode) => ({
      title: episode.title,
      guid: episode.guid,
      pubDate: episode.pubDate,
      link: episode.link,
      exists: episode.exists,
    })),
  })
}
