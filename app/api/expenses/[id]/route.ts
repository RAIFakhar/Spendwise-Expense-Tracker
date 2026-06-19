import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { expenseSchema } from '@/lib/validations'
import { parseTags } from '@/lib/utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await db.expense.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await req.json()
    const data = expenseSchema.partial().parse({ ...body, amount: body.amount ? Number(body.amount) : undefined })
    const expense = await db.expense.update({ where: { id: params.id }, data: { ...data, date: data.date ? new Date(data.date) : undefined, tags: data.tags ? JSON.stringify(data.tags) : undefined } })
    return NextResponse.json({ ...expense, tags: parseTags(expense.tags), date: expense.date.toISOString() })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await db.expense.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await db.expense.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed to delete' }, { status: 500 }) }
}
