import axios from '@/libs/axios'

export const getProducts = async () => {
  const { data } = await axios.get('/api/products')
  return data
}

export const getProduct = async (id) => {
  const { data } = await axios.get(`/api/products/${id}`)
  return data
}

export const createProduct = async (body) => {
  const { data } = await axios.post('/api/products', body)
  return data
}

export const updateProduct = async ({ id, body }) => {
  const { data } = await axios.put(`/api/products/${id}`, body)
  return data
}

export const deleteProduct = async (id) => {
  const { data } = await axios.delete(`/api/products/${id}`)
  return data
}
