import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getAppStatus,
  requestSupport,
  shutdownApp,
  startupApp
} from '@/services/app.services'
import { useAppState } from '@/store/appState'
import { useAuthStore } from '@/store/auth'

let shutdownLatched = false

export const latchShutdown = (active) => {
  shutdownLatched = Boolean(active)
}

export const useAppStatus = () => {
  const setShutdown = useAppState((state) => state.setShutdown)
  const query = useQuery({
    queryKey: ['AppStatus'],
    queryFn: getAppStatus,
    staleTime: 0,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    retry: false
  })

  useEffect(() => {
    if (typeof query.data?.shutdown !== 'boolean') return
    const next = query.data.shutdown
    setShutdown(next)
    if (next && !shutdownLatched) {
      const session = useAuthStore.getState()
      if (session.auth || session.isLogged) session.logOut()
    }
    shutdownLatched = next
  }, [query.data, setShutdown])
}

export const useShutdownApp = () => {
  const setShutdown = useAppState((state) => state.setShutdown)
  return useMutation({
    mutationFn: shutdownApp,
    onSuccess: () => {
      shutdownLatched = true
      useAuthStore.getState().logOut()
      setShutdown(true)
    }
  })
}

export const useSupportLogin = () =>
  useMutation({
    mutationFn: requestSupport
  })

export const useStartupApp = () => {
  const setShutdown = useAppState((state) => state.setShutdown)
  return useMutation({
    mutationFn: startupApp,
    onSuccess: () => {
      shutdownLatched = false
      setShutdown(false)
    }
  })
}
