import axios from '@/libs/axios'

// Solicitudes de Pedido
export const getOrderRequests = async () => {
  const { data } = await axios.get('/api/orders')
  return data
}

export const getOrderRequest = async (id) => {
  const { data } = await axios.get(`/api/orders/${id}`)
  return data
}

export const createOrderRequest = async (body) => {
  const { data } = await axios.post('/api/orders', body)
  return data
}

export const updateOrderRequest = async ({ id, body }) => {
  const { data } = await axios.put(`/api/orders/${id}`, body)
  return data
}

export const deleteOrderRequest = async (id) => {
  const { data } = await axios.delete(`/api/orders/${id}`)
  return data
}
