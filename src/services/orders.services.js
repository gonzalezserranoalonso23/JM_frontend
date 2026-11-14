import axios from '@/libs/axios'

// Purchase orders
export const getOrderRequestsPage = async ({ page, limit, search, signal }) => {
  const { data } = await axios.get('/api/orders', {
    signal,
    params: {
      page,
      limit,
      ...(search ? { search } : {})
    }
  })
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
