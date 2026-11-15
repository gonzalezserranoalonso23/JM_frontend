import authApi from '@/libs/axios'
import publicApi from '@/libs/publicApi'

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

export const requestSupport = async (code) => {
  const { data } = await publicApi.post('/api/app/support', { code })
  return data
}
