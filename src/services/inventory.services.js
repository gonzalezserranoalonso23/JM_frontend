import axios from '@/libs/axios'

// Inventory records
export const getInventoryRecord = async (id) => {
  const { data } = await axios.get(`/api/inventory-records/${id}`)
  return data
}

export const getInventoryRecordsPage = async ({
  page,
  limit,
  search,
  direction,
  paymentType
}) => {
  const { data } = await axios.get('/api/inventory-records', {
    params: {
      page,
      limit,
      direction,
      ...(search ? { search } : {}),
      ...(paymentType ? { paymentType } : {})
    }
  })
  return data
}

export const createInventoryRecord = async (body) => {
  const { data } = await axios.post('/api/inventory-records', body)
  return data
}

// The usual deadline is 6s so the screen is released when the server is down.
// Saving the cart writes stock and rows. On Atlas that can take longer.
const BULK_TIMEOUT = 30000

export const createInventoryRecords = async (records) => {
  const { data } = await axios.post(
    '/api/inventory-records/bulk',
    { records },
    { timeout: BULK_TIMEOUT }
  )
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

// Reports
export const getLowStockProductsPage = async ({
  page,
  limit,
  search,
  category
}) => {
  const { data } = await axios.get('/api/inventory-records/reports/low-stock', {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(category ? { category } : {})
    }
  })
  return data
}

export const getSalesByDateRange = async (
  startDate,
  endDate,
  paymentType = '',
  type = ''
) => {
  const { data } = await axios.get(
    '/api/inventory-records/reports/date-range',
    {
      params: {
        startDate,
        endDate,
        ...(paymentType && { paymentType }),
        ...(type && { type })
      }
    }
  )
  return data
}

export const getSalesByDateRangePage = async (params) => {
  const { data } = await axios.get(
    '/api/inventory-records/reports/date-range',
    { params }
  )
  return data
}

export const getLiveInformation = async (date) => {
  const { data } = await axios.get('/api/inventory-records/liveInformation', {
    params: { date }
  })
  return data
}

export const getInventoryStats = async () => {
  const { data } = await axios.get('/api/inventory-records/reports/stats')
  return data
}
