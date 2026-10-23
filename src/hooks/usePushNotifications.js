import { useCallback, useEffect, useState } from 'react'
import { subscribeBrowserPush } from '@/services/push.services'
import { useAuthStore } from '@/store/auth'

// Vincula este dispositivo al usuario logueado para que el push le llegue a él.
const usePushNotifications = (permission) => {
  const token = useAuthStore((state) => state.auth)
  const [ready, setReady] = useState(false)

  const subscribe = useCallback(async () => {
    if (!token) return false
    try {
      const subscription = await subscribeBrowserPush()
      const linked = Boolean(subscription)
      setReady(linked)
      return linked
    } catch {
      setReady(false)
      return false
    }
  }, [token])

  useEffect(() => {
    if (permission !== 'granted' || !token) return
    subscribe()
  }, [permission, token, subscribe])

  return { ready, subscribe }
}

export default usePushNotifications
