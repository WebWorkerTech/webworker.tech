import crypto from 'node:crypto'
import type { APIContext } from 'astro'
import { SignJWT, jwtVerify } from 'jose'
import { getEnv } from './env'

const cookieName = 'webworker_admin'

function secretKey() {
  return new TextEncoder().encode(
    getEnv('JWT_SECRET', 'dev-webworker-secret-change-me'),
  )
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export async function verifyPassword(username: string, password: string) {
  const expectedUser = getEnv('ADMIN_USERNAME', 'admin')
  if (!safeEqual(username, expectedUser)) return false

  const hash = getEnv('ADMIN_PASSWORD_SHA256')
  if (hash) {
    const actual = crypto.createHash('sha256').update(password).digest('hex')
    return safeEqual(actual, hash)
  }

  return safeEqual(password, getEnv('ADMIN_PASSWORD', 'change-me'))
}

export async function createAdminToken(username: string) {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey())
}

export async function getAdminFromContext(context: APIContext) {
  const authorization = context.request.headers.get('authorization')
  const bearer = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : ''
  const token = bearer || context.cookies.get(cookieName)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secretKey())
    return payload.sub ? { username: String(payload.sub) } : null
  } catch {
    return null
  }
}

export function setAdminCookie(context: APIContext, token: string) {
  context.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearAdminCookie(context: APIContext) {
  context.cookies.delete(cookieName, { path: '/' })
}

export function adminJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Cache-Control', 'no-store')
  return Response.json(body, {
    ...init,
    headers,
  })
}

export function unauthorized() {
  return adminJson({ error: 'Unauthorized' }, { status: 401 })
}
