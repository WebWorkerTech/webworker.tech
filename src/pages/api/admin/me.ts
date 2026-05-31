import type { APIRoute } from 'astro'
import { adminJson, getAdminFromContext, unauthorized } from '@/server/auth'

export const GET: APIRoute = async (context) => {
  const admin = await getAdminFromContext(context)
  if (!admin) return unauthorized()
  return adminJson({ admin })
}
