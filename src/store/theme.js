import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      dark: false,
      toggleTheme: () =>
        set((state) => {
          const newDark = !state.dark
          if (newDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { dark: newDark }
        })
    }),
    { name: 'jm-theme' }
  )
)

export const initTheme = () => {
  const stored = JSON.parse(
    localStorage.getItem('jm-theme') || '{"state":{"dark":false}}'
  )
  const shouldDark = Boolean(stored?.state?.dark)

  document.documentElement.classList.toggle('dark', shouldDark)
}
