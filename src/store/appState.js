import { create } from 'zustand'

const STORAGE_KEY = 'jm-app-shutdown'

const readShutdown = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const rememberShutdown = (shutdown) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, shutdown ? '1' : '0')
  } catch {
    // The screen still follows the request when storage is blocked.
  }
}

export const useAppState = create((set) => ({
  shutdown: readShutdown(),
  ready: readShutdown(),
  setShutdown: (shutdown) => {
    const next = Boolean(shutdown)
    rememberShutdown(next)
    set({ shutdown: next, ready: true })
  }
}))
