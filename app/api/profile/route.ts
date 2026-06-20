import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profileSchema } from '@/lib/validations'

export async function GET() {
  try {
    const user = await requireAuth()
    const fullUser = await db.user.findUnique({ where: { id: user.id }, select: { id: true, name: true, email: true, currency: true, theme: true, avatar: true, createdAt: true } })
    return NextResponse.json(fullUser)
  } catch { return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 }) }
}
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const data = profileSchema.parse(body)
    const updated = await db.user.update({ where: { id: user.id }, data })
    return NextResponse.json({ id: updated.id, name: updated.name, email: updated.email, currency: updated.currency, theme: updated.theme })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
