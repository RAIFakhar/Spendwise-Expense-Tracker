'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CATEGORIES, CATEGORY_COLORS, PAYMENT_METHODS } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { expenseSchema } from '@/lib/validations'
import { z } from 'zod'

type FormData = z.infer<typeof expenseSchema>

function ExpenseModal({ open, onClose, expense, onSuccess }: any) {
  const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { paymentMethod: 'cash', tags: [], date: new Date().toISOString().slice(0, 10) }
  })
  
  useState(() => {
    if (expense) reset({ ...expense, date: expense.date?.slice(0, 10), tags: expense.tags || [] })
    else reset({ amount: 0, category: '', description: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'cash', tags: [] })
  })

  async function onSubmit(data: FormData) {
    const url = expense ? `/api/expenses/${expense.id}` : '/api/expenses'
    const res = await fetch(url, { method: expense ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!res.ok) { toast.error('Failed to save'); return }
    toast.success(expense ? 'Updated!' : 'Added!'); onSuccess(); onClose()
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
              <input type="number" step="0.01" placeholder="0.00" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input type="date" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('date')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <input placeholder="What was this for?" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('description')} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('category')}>
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment</label>
              <select className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('paymentMethod')}>
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" {...register('notes')} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium text-sm disabled:opacity-50">
              {isSubmitting ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ExpensesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search, category, sort, page],
    queryFn: () => {
      const p = new URLSearchParams({ search, category, sort, page: String(page), limit: '15' })
      return fetch(`/api/expenses?${p}`).then(r => r.json())
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/expenses/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Deleted'); setDeleteId(null) },
  })

  const duplicateMutation = useMutation({
    mutationFn: (e: any) => fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: e.amount, category: e.category, description: e.description + ' (copy)', date: e.date.slice(0, 10), paymentMethod: e.paymentMethod, notes: e.notes, tags: e.tags }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Duplicated') },
  })

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1><p className="text-gray-500 text-sm">{data?.total || 0} total expenses</p></div>
        <button onClick={() => { setEditing(null); setOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium text-sm shadow-md shadow-violet-200 hover:from-violet-600 hover:to-indigo-700">
          <span className="text-lg leading-none">+</span> Add Expense
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input placeholder="🔍 Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
        ) : (data?.expenses || []).length === 0 ? (
          <div className="p-12 text-center"><p className="text-gray-400 text-lg">No expenses found</p><p className="text-gray-300 text-sm mt-1">Add your first expense above</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                  {['Description','Category','Amount','Date','Payment','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {(data?.expenses || []).map((e: any) => (
                    <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3"><p className="text-sm font-medium text-gray-900 dark:text-white">{e.description}</p>{e.notes && <p className="text-xs text-gray-400 truncate max-w-xs">{e.notes}</p>}</td>
                      <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 rounded-full" style={{backgroundColor:`${CATEGORY_COLORS[e.category]||'#94a3b8'}20`,color:CATEGORY_COLORS[e.category]||'#94a3b8'}}>{e.category}</span></td>
                      <td className="px-4 py-3 font-semibold text-red-500 text-sm">{formatCurrency(e.amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(e.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 capitalize">{e.paymentMethod?.replace('_',' ')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditing(e); setOpen(true) }} className="p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-gray-400 hover:text-violet-600 transition-colors text-xs">✏️</button>
                          <button onClick={() => duplicateMutation.mutate(e)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors text-xs">📋</button>
                          <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors text-xs">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(data?.pages || 1) > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500">{data?.total} expenses</span>
                <div className="flex gap-2">
                  <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="px-3 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">←</button>
                  <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">{page}/{data?.pages}</span>
                  <button disabled={page>=(data?.pages||1)} onClick={() => setPage(p=>p+1)} className="px-3 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">→</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Delete Expense?</h3>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium text-sm">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      <ExpenseModal open={open} onClose={() => { setOpen(false); setEditing(null) }} expense={editing} onSuccess={() => { qc.invalidateQueries({ queryKey: ['expenses'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }) }} />
    </div>
  )
}
