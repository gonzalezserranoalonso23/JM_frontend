import axios from '@/libs/axios'

export const getDailyInformations = async () => {
  const { data } = await axios.get('/api/daily-information')
  return data
}

export const createDailyInformation = async (body) => {
  const { data } = await axios.post('/api/daily-information', body)
  return data
}

export const updateDailyInformation = async ({ id, body }) => {
  const { data } = await axios.put(`/api/daily-information/${id}`, body)
  return data
}

export const deleteDailyInformation = async (id) => {
  const { data } = await axios.delete(`/api/daily-information/${id}`)
  return data
}
