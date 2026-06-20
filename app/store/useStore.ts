import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppStore {
  user: { id: string; name: string; email: string; currency: string } | null
  sidebarOpen: boolean
  setUser: (user: any) => void
  setSidebarOpen: (open: boolean) => void
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      sidebarOpen: true,
      setUser: (user) => set({ user }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: 'spendwise-store' }
  )
)
