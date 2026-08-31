import axios from '@/libs/axios'

export const login = (values) => axios.post('/api/users/login', values)

export const getUsers = async () => {
  const { data } = await axios.get('/api/users')
  return data
}

export const getUser = async (id) => {
  const { data } = await axios.get(`/api/users/${id}`)
  return data
}

export const registerUser = async (userData) => {
  const { data } = await axios.post('/api/users/register', userData)
  return data
}

export const updateUser = async (id, userData) => {
  const { data } = await axios.put(`/api/users/${id}`, userData)
  return data
}

export const deleteUser = async (id) => {
  const { data } = await axios.delete(`/api/users/${id}`)
  return data
}
