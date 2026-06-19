'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema } from '@/lib/validations'
import { z } from 'zod'
import { toast } from 'sonner'
import { useEffect } from 'react'

type FormData = z.infer<typeof profileSchema>

const CURRENCIES = ['USD','EUR','GBP','PKR','CAD','AUD','INR','JPY','CNY']

export default function ProfilePage() {
  const qc = useQueryClient()
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: () => fetch('/api/profile').then(r=>r.json()) })
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({ resolver: zodResolver(profileSchema) })

  useEffect(() => { if (profile) reset({ name: profile.name, email: profile.email, currency: profile.currency, theme: profile.theme }) }, [profile, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => fetch('/api/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()),
    onSuccess: () => { qc.invalidateQueries({queryKey:['profile']}); toast.success('Profile updated!') },
    onError: () => toast.error('Failed to update')
  })

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>)}</div>

  const initials = profile?.name?.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2)||'?'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1><p className="text-gray-500 text-sm">Manage your account settings</p></div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-200">{initials}</div>
          <div>
            <p className="font-bold text-lg text-gray-900 dark:text-white">{profile?.name}</p>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <p className="text-gray-400 text-xs mt-0.5">Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'}) : '—'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('currency')}>
                {CURRENCIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
              <select className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" {...register('theme')}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={isSubmitting || !isDirty} className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium text-sm disabled:opacity-40 shadow-md shadow-violet-200">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
