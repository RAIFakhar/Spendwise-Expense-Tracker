import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { incomeSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await db.income.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await req.json()
    const data = incomeSchema.partial().parse({ ...body, amount: body.amount ? Number(body.amount) : undefined })
    const income = await db.income.update({ where: { id: params.id }, data: { ...data, date: data.date ? new Date(data.date) : undefined } })
    return NextResponse.json({ ...income, date: income.date.toISOString() })
  } catch { return NextResponse.json({ error: 'Failed to update' }, { status: 500 }) }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await db.income.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await db.income.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed to delete' }, { status: 500 }) }
}
