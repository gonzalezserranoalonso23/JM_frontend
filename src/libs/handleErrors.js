import { toast } from 'react-hot-toast'

const STATUS_MESSAGES = {
  400: 'La solicitud no es válida',
  401: 'Sesión vencida. Vuelve a entrar.',
  403: 'No tienes permiso para esta acción',
  404: 'No se encontró lo que buscabas',
  408: 'La solicitud tardó demasiado. Intenta de nuevo.',
  409: 'Esa acción entra en conflicto con datos que ya existen',
  413: 'La solicitud es demasiado grande',
  429: 'Demasiados intentos. Espera un momento.',
  500: 'Error del servidor. Intenta de nuevo.',
  502: 'El servidor no está disponible',
  503: 'El servidor no está disponible',
  504: 'El servidor tardó demasiado en responder'
}

const serverMessage = (data) => {
  if (!data) return ''
  if (typeof data === 'string') return data
  return data.message || ''
}

const safeRedirect = (location) => {
  if (typeof location !== 'string' || !location) return null
  if (location.startsWith('/') && !location.startsWith('//')) return location
  try {
    const url = new URL(location)
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href
  } catch {
    return null
  }
  return null
}

const isOffline = () =>
  typeof navigator !== 'undefined' && navigator.onLine === false

// Clasifica cualquier fallo de la petición: sin red, 3xx, 4xx y 5xx.
export const handleErrors = (error) => {
  if (
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'CanceledError'
  ) {
    return { message: '', status: 0, ignore: true }
  }

  if (isOffline() || error?.code === 'ERR_NETWORK') {
    return {
      message: isOffline()
        ? 'Sin conexión a internet'
        : 'No se pudo conectar con el servidor',
      status: 0,
      offline: isOffline()
    }
  }

  if (error?.code === 'ECONNABORTED') {
    return { message: STATUS_MESSAGES[408], status: 408 }
  }

  const status = error?.response?.status || 0
  const messageFromServer = serverMessage(error?.response?.data)
  const location = error?.response?.headers?.location

  if (status >= 300 && status < 400) {
    return {
      message: 'El recurso se movió',
      status,
      redirectTo: safeRedirect(location)
    }
  }

  if (messageFromServer) {
    return {
      message: messageFromServer,
      status,
      logout: status === 401
    }
  }

  if (status >= 500) {
    return { message: STATUS_MESSAGES[status] || STATUS_MESSAGES[500], status }
  }

  return {
    message: STATUS_MESSAGES[status] || 'No se pudo completar la acción',
    status,
    logout: status === 401
  }
}

// El texto que ve la persona. El fallback solo cubre un 400 o 409 sin mensaje.
export const errorMessage = (error, fallback) => {
  const handled = error?.handled ?? handleErrors(error)
  if (handled.ignore) return ''
  if (!error?.response) return handled.message
  if (serverMessage(error.response.data)) return serverMessage(error.response.data)
  if (handled.status === 400 || handled.status === 409) {
    return fallback || handled.message
  }
  return handled.message || fallback || ''
}

export const notifyError = (error, fallback) => {
  const handled = error?.handled ?? handleErrors(error)
  if (handled.ignore) return
  const message = errorMessage(error, fallback)
  if (!message) return
  if (handled.offline) {
    toast.error(message, { id: 'network-offline', duration: Infinity })
    return
  }
  toast.error(message)
}
