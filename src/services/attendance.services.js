import axios from '@/libs/axios'

export const getMyAttendance = async () => {
  const { data } = await axios.get('/api/attendance/me')
  return data
}

export const getAttendanceDay = async (date) => {
  const { data } = await axios.get('/api/attendance', { params: { date } })
  return data
}

export const checkIn = async ({ latitude, longitude }) => {
  const { data } = await axios.post('/api/attendance/check-in', {
    latitude,
    longitude
  })
  return data
}

export const checkOut = async () => {
  const { data } = await axios.post('/api/attendance/check-out')
  return data
}
