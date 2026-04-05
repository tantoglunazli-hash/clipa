import { create } from 'zustand'

type Theme = 'system' | 'light' | 'dark'

interface SettingsStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const saved = (localStorage.getItem('clipa_theme') as Theme) || 'system'

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: saved,
  setTheme: (theme) => {
    localStorage.setItem('clipa_theme', theme)
    set({ theme })
    applyTheme(theme)
  },
}))

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}
