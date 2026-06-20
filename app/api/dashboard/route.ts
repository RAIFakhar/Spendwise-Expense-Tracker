import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getMonthDateRange, parseTags } from '@/lib/utils'

export async function GET() {
  try {
    const user = await requireAuth()
    const now = new Date()
    const { start, end } = getMonthDateRange(now.getMonth() + 1, now.getFullYear())
    const [monthlyExpenses, monthlyIncome, allIncome, budgets] = await Promise.all([
      db.expense.findMany({ where: { userId: user.id, date: { gte: start, lte: end } }, orderBy: { date: 'desc' } }),
      db.income.findMany({ where: { userId: user.id, date: { gte: start, lte: end } } }),
      db.income.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 100 }),
      db.budget.findMany({ where: { userId: user.id, month: now.getMonth() + 1, year: now.getFullYear() } }),
    ])
    const totalMonthlyExpenses = monthlyExpenses.reduce((s, e) => s + e.amount, 0)
    const totalMonthlyIncome = monthlyIncome.reduce((s, e) => s + e.amount, 0)
    const balance = totalMonthlyIncome - totalMonthlyExpenses
    const savingsRate = totalMonthlyIncome > 0 ? (balance / totalMonthlyIncome) * 100 : 0
    const categoryMap: Record<string, number> = {}
    monthlyExpenses.forEach(e => { categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount })
    const topCategories = Object.entries(categoryMap).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount).slice(0, 5)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const { start: s, end: en } = getMonthDateRange(d.getMonth() + 1, d.getFullYear())
      const allExp = await db.expense.findMany({ where: { userId: user.id, date: { gte: s, lte: en } } })
      const allInc = await db.income.findMany({ where: { userId: user.id, date: { gte: s, lte: en } } })
      monthlyData.push({ month: d.toLocaleString('en-US', { month: 'short' }), income: allInc.reduce((s, e) => s + e.amount, 0), expenses: allExp.reduce((s, e) => s + e.amount, 0) })
    }
    const budgetProgress = budgets.map(b => {
      const spent = monthlyExpenses.filter(e => e.category === b.category).reduce((s, e) => s + e.amount, 0)
      return { ...b, spent, percentage: (spent / b.amount) * 100 }
    })
    const recentExpenses = monthlyExpenses.slice(0, 6).map(e => ({ ...e, tags: parseTags(e.tags), type: 'expense', date: e.date.toISOString() }))
    const recentIncome = allIncome.slice(0, 3).map(i => ({ ...i, type: 'income', date: i.date.toISOString() }))
    const recentTransactions = [...recentExpenses, ...recentIncome].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)
    return NextResponse.json({ balance, monthlyIncome: totalMonthlyIncome, monthlyExpenses: totalMonthlyExpenses, totalSavings: balance, savingsRate, topCategories, monthlyData, budgetProgress, recentTransactions })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
