'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, Percent } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

function StatsCard({ title, value, icon: Icon, gradient, sub }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function AreaChartSimple({ data }: { data: any[] }) {
  if (!data?.length) return null
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expenses]))
  const h = 140
  const w = 400
  const pad = 10
  const points = (key: string) => data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((d[key] / maxVal) * (h - pad * 2))
    return `${x},${y}`
  }).join(' ')
  const polyPoints = (key: string, color: string) => {
    const pts = data.map((d, i) => ({ x: pad + (i / (data.length - 1)) * (w - pad * 2), y: h - pad - ((d[key] / maxVal) * (h - pad * 2)) }))
    const pathD = `M${pts[0].x},${h - pad} ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length-1].x},${h - pad} Z`
    return pathD
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      <defs>
        <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity="0.3"/><stop offset="95%" stopColor="#10b981" stopOpacity="0"/></linearGradient>
        <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity="0.3"/><stop offset="95%" stopColor="#f43f5e" stopOpacity="0"/></linearGradient>
      </defs>
      <path d={polyPoints('income', '#10b981')} fill="url(#gi)" />
      <path d={polyPoints('expenses', '#f43f5e')} fill="url(#ge)" />
      <polyline points={points('income')} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={points('expenses')} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <text key={i} x={pad + (i / (data.length - 1)) * (w - pad * 2)} y={h - 1} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.month}</text>
      ))}
    </svg>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => fetch('/api/dashboard').then(r => r.json()) })

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}</div>
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    </div>
  )

  const stats = [
    { title: 'Balance', value: formatCurrency(data?.balance || 0), icon: Wallet, gradient: 'from-violet-500 to-indigo-600', sub: 'This month' },
    { title: 'Income', value: formatCurrency(data?.monthlyIncome || 0), icon: TrendingUp, gradient: 'from-emerald-400 to-green-600', sub: 'This month' },
    { title: 'Expenses', value: formatCurrency(data?.monthlyExpenses || 0), icon: TrendingDown, gradient: 'from-rose-400 to-red-600', sub: 'This month' },
    { title: 'Savings Rate', value: `${(data?.savingsRate || 0).toFixed(1)}%`, icon: Percent, gradient: 'from-amber-400 to-orange-500', sub: 'Of income saved' },
  ]

  const COLORS: Record<string, string> = { Food:'#f97316',Shopping:'#8b5cf6',Rent:'#ef4444',Utilities:'#3b82f6',Transportation:'#06b6d4',Entertainment:'#ec4899',Travel:'#14b8a6',Healthcare:'#10b981',Education:'#f59e0b',Bills:'#6366f1',Investment:'#22c55e',Other:'#94a3b8' }
  const total = (data?.topCategories || []).reduce((s: number, c: any) => s + c.amount, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1><p className="text-gray-500 dark:text-gray-400 text-sm">Your financial overview for this month</p></div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}><StatsCard {...s} /></motion.div>)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Income vs Expenses</h2>
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Income</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/>Expenses</span>
            </div>
          </div>
          <AreaChartSimple data={data?.monthlyData || []} />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Top Categories</h2>
          <div className="space-y-3">
            {(data?.topCategories || []).length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No expenses yet</p> :
              (data?.topCategories || []).map((c: any) => (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[c.category]||'#94a3b8'}}/><span className="text-gray-600 dark:text-gray-400">{c.category}</span></span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(c.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${total > 0 ? (c.amount/total)*100 : 0}%`, backgroundColor: COLORS[c.category]||'#94a3b8'}} />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            <a href="/expenses" className="text-sm text-violet-600 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {(data?.recentTransactions || []).length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No transactions yet. Add your first expense!</p> :
              (data?.recentTransactions || []).map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type==='income'?'bg-green-100 dark:bg-green-900/30':'bg-red-100 dark:bg-red-900/30'}`}>
                    <span className={`text-base ${t.type==='income'?'text-green-600':'text-red-500'}`}>{t.type==='income'?'↑':'↓'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.description||t.source}</p>
                    <p className="text-xs text-gray-400">{t.category||t.source} · {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-semibold ${t.type==='income'?'text-green-600':'text-red-500'}`}>{t.type==='income'?'+':'-'}{formatCurrency(t.amount)}</span>
                </div>
              ))
            }
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Budget Status</h2>
          <div className="space-y-4">
            {(data?.budgetProgress || []).length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No budgets set yet</p> :
              (data?.budgetProgress || []).map((b: any) => {
                const pct = Math.min(b.percentage, 100)
                const color = b.percentage > 100 ? '#ef4444' : b.percentage >= 80 ? '#f59e0b' : '#8b5cf6'
                return (
                  <div key={b.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{b.category}</span>
                      <span style={{color}} className="font-semibold">{b.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, backgroundColor: color}} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{formatCurrency(b.spent)}</span>
                      <span className="text-xs text-gray-400">{formatCurrency(b.amount)}</span>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}
