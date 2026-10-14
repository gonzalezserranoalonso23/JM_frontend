import axios from '@/libs/axios'

export const getPaymentTypes = async () => {
  const { data } = await axios.get('/api/payment-types')
  return data
}

export const createPaymentType = async (body) => {
  const { data } = await axios.post('/api/payment-types', body)
  return data
}

export const updatePaymentType = async ({ id, body }) => {
  const { data } = await axios.put(`/api/payment-types/${id}`, body)
  return data
}

export const deletePaymentType = async (id) => {
  const { data } = await axios.delete(`/api/payment-types/${id}`)
  return data
}
