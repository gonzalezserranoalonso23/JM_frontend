import { useEffect } from 'react'
import { subscribeBrowserPush } from '@/services/push.services'
import { useAuthStore } from '@/store/auth'

// Vincula este dispositivo al usuario logueado para que el push le llegue a él.
const usePushNotifications = (permission) => {
  const token = useAuthStore((state) => state.auth)

  useEffect(() => {
    if (permission !== 'granted' || !token) return
    subscribeBrowserPush().catch(() => {})
  }, [permission, token])
}

export default usePushNotifications
