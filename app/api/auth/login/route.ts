import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { loginSchema } from '@/lib/validations'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)
    const user = await db.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const token = await signToken({ userId: user.id, email: user.email })
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, currency: user.currency } })
    response.cookies.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 })
    return response
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 })
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
