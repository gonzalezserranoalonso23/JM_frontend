import axios from '@/libs/axios'

export const getRoles = async () => {
  const { data } = await axios.get('/api/roles')
  return data
}

export const createRole = async (body) => {
  const { data } = await axios.post('/api/roles', body)
  return data
}

export const updateRole = async ({ id, body }) => {
  const { data } = await axios.put(`/api/roles/${id}`, body)
  return data
}

export const deleteRole = async (id) => {
  const { data } = await axios.delete(`/api/roles/${id}`)
  return data
}
