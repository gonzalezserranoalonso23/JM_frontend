import { create } from 'zustand'

export const useAppState = create((set) => ({
  shutdown: false,
  setShutdown: (shutdown) => set({ shutdown: Boolean(shutdown) })
}))
