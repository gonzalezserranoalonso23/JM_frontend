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
  from,
  to,
  signal
}) => {
  const { data } = await axios.get('/api/daily-information', {
    signal,
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {})
    }
  })
  return data
}

const EXPORT_LIMIT = 100

export const getAllDailyInformations = async ({ from = '', to = '' } = {}) => {
  const rows = []

  for (let page = 1; page <= 1000; page += 1) {
    const result = await getDailyInformationsPage({
      page,
      limit: EXPORT_LIMIT,
      from,
      to
    })
    const data = Array.isArray(result?.data) ? result.data : []
    rows.push(...data)
    if (!result?.hasNextPage || data.length === 0) break
  }
  return rows
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
