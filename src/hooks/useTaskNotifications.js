import { useCallback, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import usePushNotifications from '@/hooks/usePushNotifications'

const STORAGE_PREFIX = 'jm-notified-tasks:'
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

const readSeen = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : new Set(JSON.parse(raw))
  } catch {
    return null
  }
}

const writeSeen = (key, ids) => {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]))
  } catch {
    // no-op: sin almacenamiento solo se repetiría el aviso
  }
}

// Pide permiso al sistema. Con la app abierta avisa en el momento;
// con la app cerrada el backend empuja al dispositivo suscrito.
const useTaskNotifications = (pendingTasks) => {
  const token = useAuthStore((state) => state.auth)
  const [permission, setPermission] = useState(getPermission)
  const [asked, setAsked] = useState(wasAsked)
  const {
    ready: pushReady,
    settled: pushSettled,
    subscribe
  } = usePushNotifications(permission)

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
    const next =
      getPermission() === 'granted'
        ? 'granted'
        : await window.Notification.requestPermission()
    setPermission(next)
    if (next !== 'granted') return
    const linked = await subscribe()
    if (!linked) {
      toast.error('No se pudo activar las notificaciones en este dispositivo')
    }
  }, [subscribe])

  useEffect(() => {
    if (pushReady || !token || !pendingTasks) return
    if (getPermission() !== 'granted') return

    let userId
    try {
      userId = jwtDecode(token).id
    } catch {
      return
    }

    const mine = pendingTasks.filter((task) => task.assignedTo?._id === userId)
    const key = `${STORAGE_PREFIX}${userId}`
    const seen = readSeen(key)

    if (seen === null) {
      writeSeen(
        key,
        mine.map((task) => task._id)
      )
      return
    }

    const fresh = mine.filter((task) => !seen.has(task._id))
    if (fresh.length === 0) return

    fresh.forEach((task) => {
      const notification = new window.Notification('Pendiente asignado', {
        body: task.title,
        icon: '/icon-192.png',
        tag: task._id
      })
      notification.onclick = () => {
        window.focus()
        window.location.assign('/todolist')
      }
    })

    writeSeen(key, [...seen, ...fresh.map((task) => task._id)])
  }, [pendingTasks, token, pushReady])

  const shownPermission =
    asked && permission === 'default' ? 'dismissed' : permission

  return {
    permission: shownPermission,
    showNotifications:
      shownPermission === 'default' ||
      (shownPermission === 'granted' && pushSettled && !pushReady),
    requestPermission
  }
}

export default useTaskNotifications
