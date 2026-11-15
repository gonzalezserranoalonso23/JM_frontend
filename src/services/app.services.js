import axios from '@/libs/axios'

export const getAppStatus = async () => {
  const { data } = await axios.get('/api/app/status')
  return data
}

export const shutdownApp = async () => {
  const { data } = await axios.post('/api/app/shutdown')
  return data
}

export const startupApp = async () => {
  const { data } = await axios.post('/api/app/startup')
  return data
}

export const requestSupport = async (username) => {
  const { data } = await axios.post('/api/app/support', { username })
  return data
}
