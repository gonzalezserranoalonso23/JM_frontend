import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      auth: '',
      isLogged: false,
      profile: '',
      isAdmin: false,
      setAuth: (token) => set(() => ({ auth: token, isLogged: true })),
      setProfile: (username) => set(() => ({ profile: username })),
      setIsAdmin: (isAdmin) => set(() => ({ isAdmin })),
      logOut: () =>
        set(() => ({
          auth: '',
          isLogged: false,
          profile: '',
          isAdmin: false
        }))
    }),
    { name: 'auth' }
  )
)
