import axios from 'axios'
import { isTokenExpired, useAuthStore } from '@/store/auth'

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
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
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      const { logOut } = useAuthStore.getState()
      logOut()
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.assign('/')
      }
    }
    return Promise.reject(error)
  }
)

export default authApi
