import type { APIRoute } from 'astro'
import { adminJson, getAdminFromContext, unauthorized } from '@/server/auth'
import { enforceRateLimit } from '@/server/rate-limit'
import { importRemoteEpisodes } from '@/server/rss'
import { forbiddenOrigin, isTrustedWriteOrigin } from '@/server/security'

export const POST: APIRoute = async (context) => {
  const limited = await enforceRateLimit(context, {
    scope: 'rss-import',
    limit: 12,
    windowSeconds: 300,
  })
  if (limited) return limited

  if (!isTrustedWriteOrigin(context)) return forbiddenOrigin()

  const admin = await getAdminFromContext(context)
  if (!admin) return unauthorized()

  const body = await context.request.json().catch(() => ({}))
  const result = await importRemoteEpisodes({
    guid: body.guid ? String(body.guid) : undefined,
    importAll: Boolean(body.importAll),
  })
  return adminJson({ ok: true, ...result })
}
