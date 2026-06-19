'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { incomeSchema } from '@/lib/validations'
import { z } from 'zod'

type FormData = z.infer<typeof incomeSchema>

export default function IncomePage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const qc = useQueryClient()
  const { data: incomes, isLoading } = useQuery({ queryKey: ['income'], queryFn: () => fetch('/api/income').then(r => r.json()) })
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(incomeSchema) })

  function openAdd() { setEditing(null); reset({ amount: 0, source: '', date: new Date().toISOString().slice(0,10), notes: '' }); setOpen(true) }
  function openEdit(i: any) { setEditing(i); reset({ amount: i.amount, source: i.source, date: i.date?.slice(0,10), notes: i.notes||'' }); setOpen(true) }

  async function onSubmit(data: FormData) {
    const url = editing ? `/api/income/${editing.id}` : '/api/income'
    const res = await fetch(url, { method: editing?'PATCH':'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
    if (!res.ok) { toast.error('Failed'); return }
    toast.success(editing?'Updated!':'Added!'); qc.invalidateQueries({queryKey:['income']}); qc.invalidateQueries({queryKey:['dashboard']}); setOpen(false)
  }

  const deleteMutation = useMutation({
    mutationFn: (id:string) => fetch(`/api/income/${id}`,{method:'DELETE'}).then(r=>r.json()),
    onSuccess: () => { qc.invalidateQueries({queryKey:['income']}); qc.invalidateQueries({queryKey:['dashboard']}); toast.success('Deleted'); setDeleteId(null) }
  })

  const total = (incomes||[]).reduce((s:number,i:any)=>s+i.amount,0)

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income</h1><p className="text-gray-500 text-sm">Total: <span className="font-semibold text-green-600">{formatCurrency(total)}</span></p></div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium text-sm shadow-md">
          <span className="text-lg leading-none">+</span> Add Income
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? <div className="p-6 space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"/>)}</div>
        : (incomes||[]).length===0 ? <div className="p-12 text-center"><p className="text-gray-400">No income recorded yet</p></div>
        : (
          <table className="w-full">
            <thead><tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
              {['Source','Amount','Date','Notes','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {(incomes||[]).map((i:any)=>(
                <tr key={i.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-sm">{i.source}</td>
                  <td className="px-4 py-3 font-semibold text-green-600 text-sm">{formatCurrency(i.amount)}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(i.date)}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm truncate max-w-xs">{i.notes||'—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={()=>openEdit(i)} className="p-1.5 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors text-xs">✏️</button>
                      <button onClick={()=>setDeleteId(i.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-xs">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{editing?'Edit Income':'Add Income'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
                  <input type="number" step="0.01" placeholder="0.00" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" {...register('amount',{valueAsNumber:true})} />
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input type="date" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" {...register('date')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source *</label>
                <input placeholder="Salary, Freelance, etc." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" {...register('source')} />
                {errors.source && <p className="text-xs text-red-500 mt-1">{errors.source.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" {...register('notes')} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium text-sm disabled:opacity-50">{isSubmitting?'Saving...':editing?'Update':'Add Income'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Delete Income?</h3>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm">Cancel</button>
              <button onClick={()=>deleteMutation.mutate(deleteId)} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
