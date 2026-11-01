import axios from 'axios'
import { isTokenExpired, useAuthStore } from '@/store/auth'
import { handleErrors } from '@/libs/handleErrors'

// En macOS una conexión a un servidor apagado puede no terminar nunca.
// Este plazo aborta la petición aunque el navegador no dispare su propio timeout.
const REQUEST_TIMEOUT = 6000

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT
})

const startDeadline = (config) => {
  const timeout = config.timeout ?? REQUEST_TIMEOUT
  const controller = new AbortController()
  const timer = setTimeout(() => {
    config.timedOut = true
    controller.abort()
  }, timeout)
  const upstream = config.signal
  if (upstream) {
    if (upstream.aborted) controller.abort()
    else {
      upstream.addEventListener('abort', () => controller.abort(), {
        once: true
      })
    }
  }
  config.timeout = timeout
  config.signal = controller.signal
  config.clearDeadline = () => clearTimeout(timer)
  return config
}

authApi.interceptors.request.use((config) => {
  const { auth: token, logOut } = useAuthStore.getState()

  if (token && isTokenExpired(token)) {
    logOut()
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.assign('/')
    }
    return Promise.reject(new axios.CanceledError('Token expirado'))
  }

  config.headers = {
    ...config.headers,
    Authorization: token ? `Bearer ${token}` : ''
  }

  return startDeadline(config)
})

authApi.interceptors.response.use(
  (response) => {
    response.config.clearDeadline?.()
    return response
  },
  (error) => {
    error.config?.clearDeadline?.()
    if (error.config?.timedOut) error.code = 'ECONNABORTED'
    const handled = handleErrors(error)
    error.handled = handled
    if (handled.logout) {
      const { logOut } = useAuthStore.getState()
      logOut()
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.assign('/')
      }
    }
    if (handled.redirectTo && typeof window !== 'undefined') {
      window.location.assign(handled.redirectTo)
    }
    return Promise.reject(error)
  }
)

export default authApi
