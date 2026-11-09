import axios from '@/libs/axios'

export const getMyAttendance = async ({
  page = 1,
  from = '',
  to = ''
} = {}) => {
  const { data } = await axios.get('/api/attendance/me', {
    params: {
      page,
      limit: 10,
      ...(from && { from }),
      ...(to && { to })
    }
  })
  return data
}

export const getAttendanceDay = async (date) => {
  const { data } = await axios.get('/api/attendance', { params: { date } })
  return data
}

export const checkIn = async ({ latitude, longitude, cashReceived }) => {
  const { data } = await axios.post('/api/attendance/check-in', {
    latitude,
    longitude,
    cashReceived
  })
  return data
}

export const checkOut = async ({ latitude, longitude, cashCut }) => {
  const { data } = await axios.post('/api/attendance/check-out', {
    latitude,
    longitude,
    cashCut
  })
  return data
}
