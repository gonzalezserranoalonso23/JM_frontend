import { useCallback, useEffect, useState } from 'react'
import usePushNotifications from '@/hooks/usePushNotifications'

const ASKED_KEY = 'jm-notifications-asked'

const wasAsked = () => {
  try {
    return localStorage.getItem(ASKED_KEY) === '1'
  } catch {
    return false
  }
}

const supportsNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window

const getPermission = () =>
  supportsNotifications() ? window.Notification.permission : 'unsupported'

// Pide permiso al sistema; el backend avisa por push a quien se le asigna el pendiente.
const useTaskNotifications = () => {
  const [permission, setPermission] = useState(getPermission)
  const [asked, setAsked] = useState(wasAsked)
  usePushNotifications(permission)

  useEffect(() => {
    if (permission !== 'default' || wasAsked()) return
    try {
      localStorage.setItem(ASKED_KEY, '1')
    } catch {
      // no-op
    }
  }, [permission])

  const requestPermission = useCallback(async () => {
    if (!supportsNotifications()) return
    try {
      localStorage.setItem(ASKED_KEY, '1')
    } catch {
      // no-op
    }
    setAsked(true)
    setPermission(await window.Notification.requestPermission())
  }, [])

  return {
    permission: asked && permission === 'default' ? 'dismissed' : permission,
    requestPermission
  }
}

export default useTaskNotifications
