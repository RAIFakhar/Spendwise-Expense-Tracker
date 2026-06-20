import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production')

export async function signToken(payload: { userId: string; email: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { userId: string; email: string }
  } catch { return null }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  return db.user.findUnique({ where: { id: payload.userId }, select: { id: true, name: true, email: true, currency: true, theme: true, avatar: true } })
}

export async function requireAuth() {
  const user = await getSession()
  if (!user) throw new Error('Unauthorized')
  return user
}
