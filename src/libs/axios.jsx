import axios from 'axios'
import { isTokenExpired, useAuthStore } from '@/store/auth'
import { handleErrors } from '@/libs/handleErrors'

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  // Si el servidor no contesta, la pantalla deja de esperar en lugar de quedarse cargando.
  timeout: 25000
})

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

  return config
})

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
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
