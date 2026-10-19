import { useCallback, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '@/store/auth'

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

// Avisa de tareas pendientes asignadas al usuario mientras la app esté abierta.
const useTaskNotifications = (pendingTasks) => {
  const token = useAuthStore((state) => state.auth)
  const [permission, setPermission] = useState(getPermission)

  const [asked, setAsked] = useState(wasAsked)

  // El botón se muestra solo la primera vez: se guarda al verlo, sin ocultarlo en esta sesión
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

  useEffect(() => {
    if (!token || !pendingTasks) return

    let userId
    try {
      userId = jwtDecode(token).id
    } catch {
      return
    }

    const mine = pendingTasks.filter((task) => task.assignedTo?._id === userId)
    const key = `${STORAGE_PREFIX}${userId}`
    const seen = readSeen(key)

    // Primera ejecución: se registran las existentes sin avisar para no saturar
    if (seen === null) {
      writeSeen(
        key,
        mine.map((task) => task._id)
      )
      return
    }

    const fresh = mine.filter((task) => !seen.has(task._id))
    if (fresh.length === 0) return

    if (getPermission() === 'granted') {
      fresh.forEach((task) => {
        const notification = new window.Notification('Nueva tarea asignada', {
          body: task.title,
          icon: '/icon-192.png',
          tag: task._id
        })
        notification.onclick = () => window.focus()
      })
    }

    writeSeen(key, [...seen, ...fresh.map((task) => task._id)])
  }, [pendingTasks, token])

  return {
    permission: asked && permission === 'default' ? 'dismissed' : permission,
    requestPermission
  }
}

export default useTaskNotifications
