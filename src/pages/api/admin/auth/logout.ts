import type { APIRoute } from 'astro'
import { adminJson, clearAdminCookie } from '@/server/auth'
import { forbiddenOrigin, isTrustedWriteOrigin } from '@/server/security'

export const POST: APIRoute = async (context) => {
  if (!isTrustedWriteOrigin(context)) return forbiddenOrigin()

  clearAdminCookie(context)
  return adminJson({ ok: true })
}
