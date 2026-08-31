import axios from '@/libs/axios'

export const getSuppliers = async () => {
  const { data } = await axios.get('/api/suppliers')
  return data
}

export const getSupplier = async (id) => {
  const { data } = await axios.get(`/api/suppliers/${id}`)
  return data
}

export const createSupplier = async (body) => {
  const { data } = await axios.post('/api/suppliers', body)
  return data
}

export const updateSupplier = async ({ id, body }) => {
  const { data } = await axios.put(`/api/suppliers/${id}`, body)
  return data
}

export const deleteSupplier = async (id) => {
  const { data } = await axios.delete(`/api/suppliers/${id}`)
  return data
}
