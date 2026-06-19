'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'
import { CATEGORY_COLORS } from '@/types'

function BarChart({ data }: { data: any[] }) {
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expenses]), 1)
  return (
    <div className="flex items-end justify-between gap-1 h-40 pt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-0.5 items-end" style={{height:'120px'}}>
            <div className="flex-1 rounded-t-sm bg-emerald-400 transition-all" style={{height:`${(d.income/maxVal)*100}%`,minHeight:d.income>0?'4px':'0'}} title={`Income: ${formatCurrency(d.income)}`}/>
            <div className="flex-1 rounded-t-sm bg-rose-400 transition-all" style={{height:`${(d.expenses/maxVal)*100}%`,minHeight:d.expenses>0?'4px':'0'}} title={`Expenses: ${formatCurrency(d.expenses)}`}/>
          </div>
          <span className="text-xs text-gray-400">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

function PieChart({ data }: { data: any[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0)
  if (!total) return <p className="text-gray-400 text-sm text-center py-8">No data</p>
  let cumulative = 0
  const slices = data.slice(0, 6).map(d => {
    const pct = d.amount / total
    const start = cumulative * 360
    cumulative += pct
    const end = cumulative * 360
    const x1 = Math.cos((start - 90) * Math.PI / 180)
    const y1 = Math.sin((start - 90) * Math.PI / 180)
    const x2 = Math.cos((end - 90) * Math.PI / 180)
    const y2 = Math.sin((end - 90) * Math.PI / 180)
    const largeArc = pct > 0.5 ? 1 : 0
    return { ...d, path: `M 0 0 L ${x1*80} ${y1*80} A 80 80 0 ${largeArc} 1 ${x2*80} ${y2*80} Z`, pct }
  })
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="-90 -90 180 180" className="w-36 h-36 flex-shrink-0">
        {slices.map((s, i) => <path key={i} d={s.path} fill={CATEGORY_COLORS[s.category]||'#94a3b8'} stroke="white" strokeWidth="2" />)}
        <circle r="40" fill="white" className="dark:fill-gray-900" />
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {slices.map(s => (
          <div key={s.category} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 truncate"><span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor:CATEGORY_COLORS[s.category]||'#94a3b8'}}/><span className="text-gray-600 dark:text-gray-400 truncate">{s.category}</span></span>
            <span className="font-medium text-gray-900 dark:text-white ml-2 flex-shrink-0">{(s.pct*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data, isLoading } = useQuery({ queryKey: ['analytics', year], queryFn: () => fetch(`/api/analytics?year=${year}`).then(r=>r.json()) })

  const summaryCards = data ? [
    { label: 'Total Income', value: formatCurrency(data.summary.totalIncome), color: 'text-emerald-600' },
    { label: 'Total Expenses', value: formatCurrency(data.summary.totalExpenses), color: 'text-rose-500' },
    { label: 'Total Savings', value: formatCurrency(data.summary.totalSavings), color: data.summary.totalSavings >= 0 ? 'text-violet-600' : 'text-red-500' },
    { label: 'Savings Rate', value: `${data.summary.savingsRate.toFixed(1)}%`, color: 'text-amber-600' },
    { label: 'Avg Monthly Expense', value: formatCurrency(data.summary.avgMonthlyExpense), color: 'text-gray-700 dark:text-gray-300' },
    { label: 'Avg Daily Expense', value: formatCurrency(data.summary.avgDailyExpense), color: 'text-gray-700 dark:text-gray-300' },
  ] : []

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1><p className="text-gray-500 text-sm">Full year overview</p></div>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
          {[2023,2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {isLoading ? <div className="space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>)}</div> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {summaryCards.map(s=>(
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">Monthly Overview</h2>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block"/>Income</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-400 inline-block"/>Expenses</span>
                </div>
              </div>
              <BarChart data={data?.monthlyData||[]} />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h2>
              <PieChart data={data?.categoryBreakdown||[]} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h2>
            {(data?.categoryBreakdown||[]).length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No expense data for {year}</p> : (
              <div className="space-y-3">
                {(data?.categoryBreakdown||[]).map((c:any)=>(
                  <div key={c.category} className="flex items-center gap-3">
                    <div className="w-24 flex-shrink-0 text-sm text-gray-600 dark:text-gray-400 truncate">{c.category}</div>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${(c.amount/(data?.summary?.totalExpenses||1))*100}%`,backgroundColor:CATEGORY_COLORS[c.category]||'#94a3b8'}}/>
                    </div>
                    <div className="w-24 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(c.amount)}</div>
                    <div className="w-10 text-right text-xs text-gray-400">{((c.amount/(data?.summary?.totalExpenses||1))*100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
