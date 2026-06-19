'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { CATEGORIES } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { budgetSchema } from '@/lib/validations'
import { z } from 'zod'

type FormData = z.infer<typeof budgetSchema>

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function BudgetsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth()+1)
  const [year, setYear] = useState(now.getFullYear())
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => fetch(`/api/budgets?month=${month}&year=${year}`).then(r=>r.json())
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { month, year }
  })

  const deleteMutation = useMutation({
    mutationFn: (id:string) => fetch(`/api/budgets/${id}`,{method:'DELETE'}).then(r=>r.json()),
    onSuccess: () => { qc.invalidateQueries({queryKey:['budgets']}); toast.success('Deleted') }
  })

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/budgets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,month,year})})
    if (!res.ok) { toast.error('Failed'); return }
    toast.success('Budget set!'); qc.invalidateQueries({queryKey:['budgets']}); qc.invalidateQueries({queryKey:['dashboard']}); setOpen(false); reset()
  }

  const totalBudget = (budgets||[]).reduce((s:number,b:any)=>s+b.amount,0)
  const totalSpent = (budgets||[]).reduce((s:number,b:any)=>s+b.spent,0)

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1><p className="text-gray-500 text-sm">{MONTHS[month-1]} {year}</p></div>
        <div className="flex gap-2">
          <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
            {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e=>setYear(Number(e.target.value))} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
            {[2023,2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={()=>setOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium text-sm shadow-md">
            + Add Budget
          </button>
        </div>
      </div>

      {totalBudget > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[{label:'Total Budget',value:totalBudget,color:'text-gray-900 dark:text-white'},{label:'Total Spent',value:totalSpent,color:'text-red-500'},{label:'Remaining',value:totalBudget-totalSpent,color:totalBudget-totalSpent>=0?'text-green-600':'text-red-500'}].map(s=>(
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{formatCurrency(s.value)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? [...Array(4)].map((_,i)=><div key={i} className="h-36 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>) :
        (budgets||[]).length===0 ? (
          <div className="col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-gray-400">No budgets for this month yet</p>
            <p className="text-gray-300 text-sm mt-1">Click "Add Budget" to set spending limits</p>
          </div>
        ) : (budgets||[]).map((b:any)=>{
          const pct = Math.min(b.percentage||0,100)
          const exceeded = b.percentage > 100
          const warning = b.percentage >= 80 && !exceeded
          const barColor = exceeded?'#ef4444':warning?'#f59e0b':'#8b5cf6'
          return (
            <div key={b.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{b.category}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(b.spent)} of {formatCurrency(b.amount)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {exceeded && <span className="text-xs text-red-500 font-medium">⚠️ Exceeded</span>}
                  {warning && !exceeded && <span className="text-xs text-amber-500 font-medium">⚠️ 80%+</span>}
                  <button onClick={()=>deleteMutation.mutate(b.id)} className="ml-2 text-gray-300 hover:text-red-400 text-sm">✕</button>
                </div>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,backgroundColor:barColor}}/>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{color:barColor}}>{(b.percentage||0).toFixed(0)}% used</span>
                <span className="text-xs text-gray-400">Remaining: {formatCurrency(b.remaining||0)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Set Budget for {MONTHS[month-1]} {year}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('category')}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Amount *</label>
                <input type="number" step="0.01" placeholder="0.00" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('amount',{valueAsNumber:true})} />
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium text-sm disabled:opacity-50">{isSubmitting?'Saving...':'Set Budget'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
