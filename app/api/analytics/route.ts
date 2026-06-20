import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getMonthDateRange } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const year = parseInt(req.nextUrl.searchParams.get('year') || String(new Date().getFullYear()))
    const [expenses, income] = await Promise.all([
      db.expense.findMany({ where: { userId: user.id, date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } } }),
      db.income.findMany({ where: { userId: user.id, date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } } }),
    ])
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const { start, end } = getMonthDateRange(i + 1, year)
      const mExp = expenses.filter(e => new Date(e.date) >= start && new Date(e.date) <= end)
      const mInc = income.filter(e => new Date(e.date) >= start && new Date(e.date) <= end)
      const totalExp = mExp.reduce((s, e) => s + e.amount, 0)
      const totalInc = mInc.reduce((s, e) => s + e.amount, 0)
      return { month: new Date(year, i).toLocaleString('en-US', { month: 'short' }), income: totalInc, expenses: totalExp, savings: totalInc - totalExp }
    })
    const categoryData: Record<string, number> = {}
    expenses.forEach(e => { categoryData[e.category] = (categoryData[e.category] || 0) + e.amount })
    const categoryBreakdown = Object.entries(categoryData).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount)
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
    const totalIncome = income.reduce((s, e) => s + e.amount, 0)
    return NextResponse.json({ monthlyData, categoryBreakdown, summary: { totalExpenses, totalIncome, totalSavings: totalIncome - totalExpenses, avgMonthlyExpense: totalExpenses / 12, avgDailyExpense: totalExpenses / 365, savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0, highestCategory: categoryBreakdown[0]?.category || 'N/A', highestCategoryAmount: categoryBreakdown[0]?.amount || 0 } })
  } catch { return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 }) }
}
