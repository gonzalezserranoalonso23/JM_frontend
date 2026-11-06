import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import { clearQueryCache } from '@/lib/queryClient'

const AUTH_STORAGE_KEY = 'auth'
const AUTH_COOKIE_NAME = 'jm-auth-backup'
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const clearAuthPersistence = () => {
  clearQueryCache()
  removeCookie(AUTH_COOKIE_NAME)
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // no-op
  }
}

export const isTokenExpired = (token) => {
  if (!token) return true

  try {
    const decoded = jwtDecode(token)
    return Date.now() >= decoded.exp * 1000
  } catch {
    return true
  }
}

const readCookie = (name) => {
  if (typeof document === 'undefined') return null
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
  if (!cookie) return null
  return decodeURIComponent(cookie.slice(name.length + 1))
}

const readAuthBackup = () => {
  const raw = readCookie(AUTH_COOKIE_NAME)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const writeCookie = (name, value) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`
}

const removeCookie = (name) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

const writeAuthBackup = (authState) => {
  if (!authState?.token) return

  writeCookie(
    AUTH_COOKIE_NAME,
    JSON.stringify({
      token: authState.token,
      profile: authState.profile || '',
      role: authState.role || ''
    })
  )
}

const authStorage = {
  getItem: (name) => {
    if (typeof localStorage === 'undefined') return null
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(name, value)
    } catch {
      // no-op: fallback cookie is handled by store actions
    }
  },
  removeItem: (name) => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.removeItem(name)
    } catch {
      // no-op
    }
  }
}

export const useAuthStore = create(
  persist(
    (set) => ({
      auth: '',
      isLogged: false,
      profile: '',
      role: '',
      setAuth: (token) =>
        set((state) => {
          if (isTokenExpired(token)) {
            clearAuthPersistence()
            return {
              auth: '',
              isLogged: false,
              profile: '',
              role: ''
            }
          }

          const nextState = { ...state, auth: token, isLogged: true }
          writeAuthBackup({
            token,
            profile: nextState.profile,
            role: nextState.role
          })
          return { auth: token, isLogged: true }
        }),
      setProfile: (username) =>
        set((state) => {
          writeAuthBackup({
            token: state.auth,
            profile: username,
            role: state.role
          })
          return { profile: username }
        }),
      setRole: (role) =>
        set((state) => {
          writeAuthBackup({
            token: state.auth,
            profile: state.profile,
            role: role || ''
          })
          return { role: role || '' }
        }),
      logOut: () =>
        set(() => {
          clearAuthPersistence()
          return {
            auth: '',
            isLogged: false,
            profile: '',
            role: ''
          }
        })
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => authStorage),
      partialize: (state) => ({
        auth: state.auth,
        isLogged: state.isLogged,
        profile: state.profile,
        role: state.role
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return

        if (!state.auth) {
          const backup = readAuthBackup()
          if (backup?.token && !isTokenExpired(backup.token)) {
            state.setAuth(backup.token)
            if (backup.profile) state.setProfile(backup.profile)
            if (backup.role) state.setRole(backup.role)
          }
        } else if (isTokenExpired(state.auth)) {
          state.logOut()
        } else if (!state.isLogged) {
          state.setAuth(state.auth)
        }
      }
    }
  )
)
