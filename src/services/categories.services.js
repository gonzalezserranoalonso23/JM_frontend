import axios from '@/libs/axios'

export const getCategories = async () => {
  const { data } = await axios.get('/api/categories')
  return data
}

export const getCategory = async (id) => {
  const { data } = await axios.get(`/api/categories/${id}`)
  return data
}

export const createCategory = async (body) => {
  const { data } = await axios.post('/api/categories', body)
  return data
}

export const updateCategory = async ({ id, body }) => {
  const { data } = await axios.put(`/api/categories/${id}`, body)
  return data
}

export const deleteCategory = async (id) => {
  const { data } = await axios.delete(`/api/categories/${id}`)
  return data
}
