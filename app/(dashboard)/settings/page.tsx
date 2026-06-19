'use client'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(true)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1><p className="text-gray-500 text-sm">App preferences and notifications</p></div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
        {[
          { label:'Email notifications', desc:'Receive weekly summaries via email', val:notifications, set:setNotifications },
          { label:'Budget alerts', desc:'Get notified when approaching budget limits', val:budgetAlerts, set:setBudgetAlerts },
        ].map(s=>(
          <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div><p className="text-sm font-medium text-gray-900 dark:text-white">{s.label}</p><p className="text-xs text-gray-400 mt-0.5">{s.desc}</p></div>
            <button onClick={()=>{s.set(!s.val);toast.success('Setting saved')}} className={`relative w-11 h-6 rounded-full transition-colors ${s.val?'bg-violet-500':'bg-gray-200 dark:bg-gray-700'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${s.val?'translate-x-5':''}`}/>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">About SpendWise</h2>
        <div className="space-y-2 text-sm text-gray-500">
          <p>Version: <span className="font-medium text-gray-700 dark:text-gray-300">1.0.0</span></p>
          <p>Stack: <span className="font-medium text-gray-700 dark:text-gray-300">Next.js 14 · Prisma · SQLite · Tailwind CSS</span></p>
          <p>Auth: <span className="font-medium text-gray-700 dark:text-gray-300">JWT + bcrypt · HTTP-only cookies</span></p>
          <p>License: <span className="font-medium text-gray-700 dark:text-gray-300">MIT — Free to use & deploy</span></p>
        </div>
      </div>
    </div>
  )
}
