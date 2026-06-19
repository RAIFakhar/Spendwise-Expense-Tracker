import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { incomeSchema } from '@/lib/validations'

export async function GET() {
  try {
    const user = await requireAuth()
    const incomes = await db.income.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' } })
    return NextResponse.json(incomes.map(i => ({ ...i, date: i.date.toISOString() })))
  } catch { return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 }) }
}
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const data = incomeSchema.parse({ ...body, amount: Number(body.amount) })
    const income = await db.income.create({ data: { ...data, date: new Date(data.date), userId: user.id } })
    return NextResponse.json({ ...income, date: income.date.toISOString() }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 })
  }
}
