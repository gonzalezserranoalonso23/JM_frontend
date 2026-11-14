import axios from '@/libs/axios'

export const getProduct = async (id) => {
  const { data } = await axios.get(`/api/products/${id}`)
  return data
}

export const getPromotionProductsPage = async ({
  page,
  limit,
  search,
  category
}) => {
  const { data } = await axios.get('/api/products/promotions', {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(category ? { category } : {})
    }
  })
  return data
}

export const getProductLookup = async ({
  search = '',
  activeOnly = false,
  signal
} = {}) => {
  const { data } = await axios.get('/api/products/lookup', {
    signal,
    params: {
      ...(search ? { search } : {}),
      ...(activeOnly ? { active: '1' } : {})
    }
  })
  return data
}

export const getProductsPage = async ({ page, limit, search }) => {
  const { data } = await axios.get('/api/products', {
    params: { page, limit, ...(search ? { search } : {}) }
  })
  return data
}

const EXPORT_LIMIT = 100

const collectPages = async (loadPage) => {
  const rows = []
  for (let page = 1; page <= 1000; page += 1) {
    const result = await loadPage(page)
    if (Array.isArray(result)) return result
    const data = Array.isArray(result?.data) ? result.data : []
    rows.push(...data)
    if (!result?.hasNextPage || data.length === 0) break
  }
  return rows
}

export const getAllProducts = (search = '') =>
  collectPages((page) => getProductsPage({ page, limit: EXPORT_LIMIT, search }))

export const getAllPromotionProducts = (search = '', category = '') =>
  collectPages((page) =>
    getPromotionProductsPage({
      page,
      limit: EXPORT_LIMIT,
      search,
      category
    })
  )

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
