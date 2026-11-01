import { useCallback, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import usePushNotifications from '@/hooks/usePushNotifications'
import { needsHomeScreenInstall } from '@/services/push.services'

const STORAGE_PREFIX = 'jm-notified-tasks:'

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
const blockedMessage = () =>
  isAppleBrowser()
    ? 'Safari bloqueó las notificaciones. En Safari, Ajustes, Sitios web, Notificaciones, permite este sitio.'
    : 'Chrome bloqueó las notificaciones. A la izquierda de la dirección abre la configuración del sitio, Notificaciones, y elige Permitir.'

const homeScreenMessage =
  'En el iPhone, toca Compartir, elige Agregar a pantalla de inicio y abre JM Panel desde ese ícono. Ahí se activan las notificaciones.'

const foregroundMessage =
  'Avisos activados mientras JM Panel esté abierto. Este navegador no puede recibirlos con la app cerrada.'

const isAppleBrowser = () => {
  const ua = navigator.userAgent || ''
  if (/CriOS|FxiOS|EdgiOS/.test(ua)) return true
  return /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)
}

const pushServiceMissing = (error) =>
  error?.name === 'AbortError' &&
  /push service not available/i.test(error?.message || '')

const useTaskNotifications = (pendingTasks) => {
  const token = useAuthStore((state) => state.auth)
  const [permission, setPermission] = useState(getPermission)
  const [foregroundOnly, setForegroundOnly] = useState(false)
  const { ready: pushReady, subscribe } = usePushNotifications(permission)

  const requestPermission = useCallback(async () => {
    if (needsHomeScreenInstall()) {
      toast.error(homeScreenMessage)
      return
    }
    if (!supportsNotifications()) {
      toast.error('Este navegador no puede mostrar notificaciones')
      return
    }
    if (getPermission() === 'denied') {
      toast.error(blockedMessage())
      return
    }
    if (!isAppleBrowser() && getPermission() === 'default') {
      const next = await window.Notification.requestPermission()
      setPermission(next)
      if (next !== 'granted') {
        if (next === 'denied') toast.error(blockedMessage())
        return
      }
    }
    try {
      // En Safari, subscribe() muestra el permiso. Pedirlo antes gasta el toque.
      const linked = await subscribe()
      const next = getPermission()
      if (linked || next === 'granted') setPermission('granted')
      else setPermission(next)
      if (next === 'denied') {
        toast.error(blockedMessage())
        return
      }
      if (!linked) {
        toast.error('No se pudo activar las notificaciones en este dispositivo')
        return
      }
      toast.success('Notificaciones activadas')
    } catch (error) {
      const next = getPermission()
      if (next === 'granted') setPermission('granted')
      else setPermission(next)
      if (pushServiceMissing(error) && next === 'granted') {
        setForegroundOnly(true)
        toast.success(foregroundMessage)
        return
      }
      if (next === 'granted') return
      if (next === 'denied' || error?.name === 'NotAllowedError') {
        toast.error(blockedMessage())
        return
      }
      toast.error(
        error?.publicMessage ||
          'No se pudo activar las notificaciones en este dispositivo'
      )
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

  useEffect(() => {
    if (!supportsNotifications() || !navigator.permissions?.query) return undefined
    let status
    navigator.permissions
      .query({ name: 'notifications' })
      .then((result) => {
        status = result
        result.onchange = () => {
          setPermission(result.state === 'prompt' ? 'default' : result.state)
        }
      })
      .catch(() => {})
    return () => {
      if (status) status.onchange = null
    }
  }, [])

  const active = permission === 'granted' || pushReady || foregroundOnly

  return {
    permission,
    showNotifications:
      !active &&
      (needsHomeScreenInstall() || permission !== 'unsupported'),
    requestPermission
  }
}

export default useTaskNotifications
