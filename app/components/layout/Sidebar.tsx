'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, TrendingUp, Target, BarChart3, User, Settings, ChevronLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/income', icon: TrendingUp, label: 'Income' },
  { href: '/budgets', icon: Target, label: 'Budgets' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useStore()

  return (
    <aside className={`relative hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200 ${sidebarOpen ? 'w-60' : 'w-[72px]'}`}>
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800 h-16">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        </div>
        {sidebarOpen && <span className="font-bold text-gray-900 dark:text-white text-lg whitespace-nowrap">SpendWise</span>}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${active ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
            </Link>
          )
        })}
      </nav>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center hover:bg-gray-50">
        <ChevronLeft className={`w-3 h-3 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
      </button>
    </aside>
  )
}
