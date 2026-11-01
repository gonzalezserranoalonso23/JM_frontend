import axios from '@/libs/axios'

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

const sameApplicationKey = (subscription, publicKey) => {
  const current = subscription?.options?.applicationServerKey
  if (!current) return true
  const next = urlBase64ToUint8Array(publicKey)
  const bytes = new Uint8Array(current)
  if (bytes.length !== next.length) return false
  return bytes.every((byte, index) => byte === next[index])
}

const keyError = (message) => {
  const error = new Error(message)
  error.publicMessage = message
  return error
}

const getVapidPublicKey = async () => {
  try {
    const { data } = await axios.get('/api/push/vapid-public-key')
    const publicKey = String(data?.publicKey || '').trim()
    if (urlBase64ToUint8Array(publicKey).length !== 65) {
      throw keyError('La clave pública de notificaciones no es válida')
    }
    return publicKey
  } catch (error) {
    if (error.publicMessage) throw error
    const message = error?.response?.data?.message
    if (error?.response?.status === 503 && message) throw keyError(message)
    throw error
  }
}

const savePushSubscription = async (subscription) => {
  const { data } = await axios.post('/api/push/subscribe', subscription)
  return data
}

// En un Safari tab del iPhone no existe Notification. Hay que abrir la app
// desde el ícono de la pantalla de inicio.
export const needsHomeScreenInstall = () =>
  typeof navigator !== 'undefined' &&
  'standalone' in navigator &&
  navigator.standalone === false &&
  typeof window !== 'undefined' &&
  !('Notification' in window)

let prepared = null
let preparing = null

// La clave y el service worker se resuelven al cargar. Safari pierde el toque
// si subscribe() espera una red o el registro del worker.
export const preparePush = () => {
  if (prepared) return Promise.resolve(prepared)
  if (!preparing) {
    preparing = (async () => {
      if (!('serviceWorker' in navigator)) return null
      await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      const registration = await navigator.serviceWorker.ready
      const publicKey = await getVapidPublicKey()
      prepared = {
        registration,
        publicKey,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      }
      return prepared
    })().catch((error) => {
      preparing = null
      throw error
    })
  }
  return preparing
}

const pushManagerOf = (registration) => {
  if (registration?.pushManager) return registration.pushManager
  if (typeof window !== 'undefined' && 'pushManager' in window) {
    return window.pushManager
  }
  return null
}

export const subscribeBrowserPush = async () => {
  const ready = prepared || (await preparePush())
  const pushManager = pushManagerOf(ready?.registration)
  if (!pushManager || !ready?.applicationServerKey) return null

  let subscription = await pushManager.getSubscription()
  if (subscription && !sameApplicationKey(subscription, ready.publicKey)) {
    await subscription.unsubscribe()
    subscription = null
  }

  if (!subscription) {
    const options = {
      userVisibleOnly: true,
      applicationServerKey: ready.applicationServerKey
    }
    try {
      subscription = await pushManager.subscribe(options)
    } catch (error) {
      const unavailable =
        error?.name === 'AbortError' &&
        /push service not available/i.test(error?.message || '')
      if (!unavailable) throw error
      await new Promise((resolve) => setTimeout(resolve, 1000))
      subscription = await pushManager.subscribe(options)
    }
  }

  await savePushSubscription(subscription.toJSON())
  return subscription
}
