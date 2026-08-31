import axios from '@/libs/axios'

// Registros de inventario
export const getInventoryRecords = async () => {
  const { data } = await axios.get('/api/inventory-records')
  return data
}

export const getInventoryRecord = async (id) => {
  const { data } = await axios.get(`/api/inventory-records/${id}`)
  return data
}

export const createInventoryRecord = async (body) => {
  const { data } = await axios.post('/api/inventory-records', body)
  return data
}

export const updateInventoryRecord = async ({ id, body }) => {
  const { data } = await axios.put(`/api/inventory-records/${id}`, body)
  return data
}

export const deleteInventoryRecord = async (id) => {
  const { data } = await axios.delete(`/api/inventory-records/${id}`)
  return data
}

// Reportes
export const getDailySalesSummary = async (date) => {
  const { data } = await axios.get(
    '/api/inventory-records/reports/daily-summary',
    {
      params: { date }
    }
  )
  return data
}

export const getLowStockProducts = async () => {
  const { data } = await axios.get('/api/inventory-records/reports/low-stock')
  return data
}

export const getSalesByDateRange = async (startDate, endDate) => {
  const { data } = await axios.get(
    '/api/inventory-records/reports/date-range',
    {
      params: { startDate, endDate }
    }
  )
  return data
}

export const getInventoryByType = async (type) => {
  const { data } = await axios.get('/api/inventory-records/reports/by-type', {
    params: { type }
  })
  return data
}

export const getInventoryStats = async () => {
  const { data } = await axios.get('/api/inventory-records/reports/stats')
  return data
}
