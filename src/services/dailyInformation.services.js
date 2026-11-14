import axios from '@/libs/axios'

export const getDailyInformationByDate = async (date, signal) => {
  const { data } = await axios.get('/api/daily-information', {
    signal,
    params: { date }
  })
  return data
}

export const getDailyInformationsPage = async ({
  page,
  limit,
  search,
  signal
}) => {
  const { data } = await axios.get('/api/daily-information', {
    signal,
    params: {
      page,
      limit,
      ...(search ? { search } : {})
    }
  })
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
