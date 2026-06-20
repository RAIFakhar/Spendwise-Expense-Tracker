import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { budgetSchema } from '@/lib/validations'
import { getMonthDateRange } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = req.nextUrl
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const budgets = await db.budget.findMany({ where: { userId: user.id, month, year } })
    const { start, end } = getMonthDateRange(month, year)
    const expenses = await db.expense.findMany({ where: { userId: user.id, date: { gte: start, lte: end } } })
    return NextResponse.json(budgets.map(b => {
      const spent = expenses.filter(e => e.category === b.category).reduce((s, e) => s + e.amount, 0)
      return { ...b, spent, percentage: (spent / b.amount) * 100, remaining: b.amount - spent }
    }))
  } catch { return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 }) }
}
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const data = budgetSchema.parse({ ...body, amount: Number(body.amount), month: Number(body.month), year: Number(body.year) })
    const budget = await db.budget.upsert({
      where: { userId_category_month_year: { userId: user.id, ...data } },
      update: { amount: data.amount },
      create: { ...data, userId: user.id },
    })
    return NextResponse.json(budget, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 })
  }
}
