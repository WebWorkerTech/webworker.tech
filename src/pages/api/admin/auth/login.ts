import type { APIRoute } from 'astro'
import {
  adminJson,
  createAdminToken,
  setAdminCookie,
  verifyPassword,
} from '@/server/auth'
import { enforceRateLimit } from '@/server/rate-limit'
import { forbiddenOrigin, isTrustedWriteOrigin } from '@/server/security'

export const POST: APIRoute = async (context) => {
  const limited = await enforceRateLimit(context, {
    scope: 'admin-login',
    limit: 8,
    windowSeconds: 60,
  })
  if (limited) return limited

  if (!isTrustedWriteOrigin(context)) return forbiddenOrigin()

  const body = await context.request.json().catch(() => ({}))
  const username = String(body.username || '')
  const password = String(body.password || '')

  if (!(await verifyPassword(username, password))) {
    return adminJson({ error: 'Invalid username or password' }, { status: 401 })
  }

  const token = await createAdminToken(username)
  setAdminCookie(context, token)
  return adminJson({ ok: true, token })
}
