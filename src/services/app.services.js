import axios from 'axios'
import authApi from '@/libs/axios'

// Status and support stay public. The auth client would cancel them and send
// the browser to login when the saved token is expired or already closed.
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 6000
})

export const getAppStatus = async () => {
  const { data } = await publicApi.get('/api/app/status', {
    params: { _: Date.now() },
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
  })
  return data
}

export const shutdownApp = async () => {
  const { data } = await authApi.post('/api/app/shutdown')
  return data
}

export const startupApp = async () => {
  const { data } = await authApi.post('/api/app/startup')
  return data
}

export const requestSupport = async (username) => {
  const { data } = await publicApi.post('/api/app/support', { username })
  return data
}
