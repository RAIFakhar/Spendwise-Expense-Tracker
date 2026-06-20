'use client'
import { useRouter } from 'next/navigation'
import { Moon, Sun, LogOut, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useStore } from '@/store/useStore'
import { toast } from 'sonner'

export function Header({ user }: { user: { name: string; email: string } }) {
  const { theme, setTheme } = useTheme()
  const { setSidebarOpen } = useStore()
  const router = useRouter()
  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out'); router.push('/login')
  }

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 md:px-6 gap-4 flex-shrink-0">
      <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSidebarOpen(true)}>
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700 ml-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
          <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors ml-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
