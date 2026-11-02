import axios from '@/libs/axios'

// Registros de inventario
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

// El plazo general es de 6s para soltar la pantalla si el servidor está caído.
// Registrar el carrito escribe stock y renglones; en Atlas puede tardar más.
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

// Reportes
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
