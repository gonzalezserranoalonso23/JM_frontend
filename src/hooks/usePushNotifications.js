import { useCallback, useEffect, useState } from 'react'
import { preparePush, subscribeBrowserPush } from '@/services/push.services'
import { useAuthStore } from '@/store/auth'

// Vincula este dispositivo al usuario logueado para que el push le llegue a él.
const usePushNotifications = (permission) => {
  const token = useAuthStore((state) => state.auth)
  const [ready, setReady] = useState(false)
  const [settled, setSettled] = useState(permission !== 'granted')

  const subscribe = useCallback(async () => {
    if (!token) return false
    try {
      const subscription = await subscribeBrowserPush()
      const linked = Boolean(subscription)
      setReady(linked)
      return linked
    } catch (error) {
      setReady(false)
      throw error
    }
  }, [token])

  useEffect(() => {
    if (!token) return undefined
    preparePush().catch(() => {})
    return undefined
  }, [token])

  useEffect(() => {
    if (permission !== 'granted' || !token) {
      setSettled(permission !== 'granted')
      return undefined
    }
    let cancelled = false
    setSettled(false)
    subscribe()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSettled(true)
      })
    return () => {
      cancelled = true
    }
  }, [permission, token, subscribe])

  return { ready, settled, subscribe }
}

export default usePushNotifications
