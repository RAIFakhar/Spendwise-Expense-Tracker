import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { expenseSchema } from '@/lib/validations'
import { parseTags } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = req.nextUrl
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const where: any = { userId: user.id }
    if (search) where.OR = [{ description: { contains: search } }, { notes: { contains: search } }, { tags: { contains: search } }]
    if (category) where.category = category
    if (from || to) where.date = { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) }
    const orderBy: any = { newest: { date: 'desc' }, oldest: { date: 'asc' }, highest: { amount: 'desc' }, lowest: { amount: 'asc' } }[sort] || { date: 'desc' }
    const [expenses, total] = await Promise.all([
      db.expense.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      db.expense.count({ where }),
    ])
    return NextResponse.json({ expenses: expenses.map(e => ({ ...e, tags: parseTags(e.tags), date: e.date.toISOString() })), total, pages: Math.ceil(total / limit) })
  } catch { return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const data = expenseSchema.parse({ ...body, amount: Number(body.amount) })
    const expense = await db.expense.create({ data: { ...data, date: new Date(data.date), tags: JSON.stringify(data.tags || []), userId: user.id } })
    return NextResponse.json({ ...expense, tags: parseTags(expense.tags), date: expense.date.toISOString() }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
