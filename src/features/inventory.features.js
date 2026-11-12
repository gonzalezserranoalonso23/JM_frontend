import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { notifyError } from '@/libs/handleErrors'
import { applyStockToCatalog } from '@/features/products.features'
import {
  fitsMovementList,
  idOf,
  prependInventoryRecords,
  removeInventoryRecord,
  replaceInventoryRecord,
  stockDelta
} from '@/features/liveCache'
import {
  getInventoryRecord,
  getInventoryRecordsPage,
  createInventoryRecord,
  createInventoryRecords,
  updateInventoryRecord,
  deleteInventoryRecord,
  getLowStockProductsPage,
  getSalesByDateRangePage,
  getInventoryStats,
  getLiveInformation
} from '@/services/inventory.services'

// An entry or exit updates stock and the lists derived from it.
// The screen paints the change at once; the refetch confirms it.
// Daily information is not part of this refresh.
const invalidateStockQueries = (queryClient) => {
  for (const key of [
    'InventoryRecords',
    'InventoryStats',
    'LowStockProducts',
    'Products',
    'LiveInformation'
  ]) {
    queryClient.invalidateQueries({ queryKey: [key] })
  }
}

const eachList = (queryClient, update) => {
  for (const [queryKey, data] of queryClient.getQueriesData({
    queryKey: ['InventoryRecords', 'pages']
  })) {
    const next = update(data, queryKey)
    if (next !== data) queryClient.setQueryData(queryKey, next)
  }
}

const findCachedProduct = (queryClient, id) => {
  const target = idOf(id)
  for (const [, data] of queryClient.getQueriesData({
    queryKey: ['Products']
  })) {
    const rows = [
      ...(data?.data || []),
      ...(data?.pages || []).flatMap((page) => page.data || [])
    ]
    const found = rows.find((row) => idOf(row) === target)
    if (found) return found
  }
  return null
}

const findCachedRecord = (queryClient, id) => {
  const target = String(id)
  for (const [, data] of queryClient.getQueriesData({
    queryKey: ['InventoryRecords', 'pages']
  })) {
    for (const page of data?.pages || []) {
      const found = (page.data || []).find((row) => String(row._id) === target)
      if (found) return found
    }
  }
  return null
}

const lookupById = (list, id) =>
  (list || []).find((item) => String(item._id) === String(id)) || null

const movementFromPayload = (queryClient, id, payload = {}) => {
  const rawProduct = payload.productName
  const product =
    findCachedProduct(queryClient, rawProduct) ||
    (rawProduct && typeof rawProduct === 'object' ? rawProduct : null)
  const rawType = payload.typeInventory
  const type =
    lookupById(queryClient.getQueryData(['TypeInventories']), idOf(rawType)) ||
    (rawType && typeof rawType === 'object' ? rawType : null)
  const rawPayment = payload.paymentType
  const payment =
    lookupById(queryClient.getQueryData(['PaymentTypes']), idOf(rawPayment)) ||
    (rawPayment && typeof rawPayment === 'object' ? rawPayment : null)
  return {
    _id: id,
    date: payload.date,
    quantity: payload.quantity,
    productPrice: payload.productPrice,
    purchasePrice: payload.purchasePrice ?? product?.purchasePrice,
    totalAmount: payload.totalAmount,
    productName: product
      ? { _id: product._id, productName: product.productName }
      : { _id: idOf(rawProduct) },
    typeInventory: type
      ? {
          _id: type._id,
          typeInventory: type.typeInventory,
          stockDirection: type.stockDirection
        }
      : { _id: idOf(rawType) },
    category: product?.category || null,
    paymentType: payment
      ? { _id: payment._id, paymentType: payment.paymentType }
      : idOf(rawPayment)
        ? { _id: idOf(rawPayment) }
        : null
  }
}

const hasRecord = (current, id) =>
  (current?.pages || []).some((page) =>
    (page.data || []).some((row) => String(row._id) === String(id))
  )

const placeRecords = (queryClient, records) => {
  eachList(queryClient, (current, queryKey) => {
    if (!current?.pages) return current
    return records.reduce((next, record) => {
      const fits = fitsMovementList(queryKey, record)
      if (fits === null) return next
      if (!fits) return removeInventoryRecord(next, record._id)
      if (hasRecord(next, record._id)) {
        return replaceInventoryRecord(next, record._id, record)
      }
      return prependInventoryRecords(next, [record])
    }, current)
  })
}

const deltasOf = (records) => {
  const deltas = {}
  for (const record of records) {
    const id = idOf(record.productName)
    const delta = stockDelta(
      record.typeInventory?.stockDirection,
      record.quantity
    )
    if (!id || !delta) continue
    deltas[id] = stockDelta(1, (deltas[id] || 0) + delta)
  }
  return deltas
}

const rememberMovements = (queryClient, records) => {
  if (!records.length) return
  placeRecords(queryClient, records)
  applyStockToCatalog(queryClient, deltasOf(records))
}

const recordsFromCreate = (queryClient, data, variables) => {
  if (Array.isArray(data)) {
    const payloads = Array.isArray(variables) ? variables : []
    return data.map((item, index) =>
      movementFromPayload(queryClient, item?._id || item, payloads[index])
    )
  }
  if (data?._id && data.productName) return [data]
  return []
}

const rememberUpdate = (queryClient, _saved, variables) => {
  const previous = findCachedRecord(queryClient, variables?.id || _saved?._id)
  if (!previous) return
  const payload = variables?.body || {}
  const next = movementFromPayload(queryClient, previous._id, {
    date: payload.date ?? previous.date,
    quantity: payload.quantity ?? previous.quantity,
    productPrice: payload.productPrice ?? previous.productPrice,
    totalAmount: payload.totalAmount ?? previous.totalAmount,
    productName: payload.productName || previous.productName,
    typeInventory: payload.typeInventory || previous.typeInventory,
    paymentType:
      payload.paymentType === undefined
        ? previous.paymentType
        : payload.paymentType
  })
  if (payload.totalAmount == null && previous.totalAmount != null) {
    next.totalAmount = previous.totalAmount
  }
  const previousDelta = stockDelta(
    previous.typeInventory?.stockDirection,
    previous.quantity
  )
  const nextDelta = stockDelta(
    next.typeInventory?.stockDirection,
    next.quantity
  )
  const changes = {}
  const add = (id, delta) => {
    if (!id || !delta) return
    changes[id] = stockDelta(1, (changes[id] || 0) + delta)
  }
  const previousId = idOf(previous.productName)
  const nextId = idOf(next.productName)
  if (previousId === nextId) add(nextId, nextDelta - previousDelta)
  else {
    add(previousId, -previousDelta)
    add(nextId, nextDelta)
  }
  placeRecords(queryClient, [next])
  applyStockToCatalog(queryClient, changes)
}

export const useGetInventoryRecord = (id) =>
  useQuery({
    queryKey: ['InventoryRecords', id],
    queryFn: () => getInventoryRecord(id),
    enabled: Boolean(id)
  })

// Registros
export const useGetInventoryRecordPages = ({
  direction,
  search = '',
  paymentType = ''
}) =>
  useInfiniteQuery({
    queryKey: ['InventoryRecords', 'pages', direction, search, paymentType],
    queryFn: ({ pageParam }) =>
      getInventoryRecordsPage({
        page: pageParam,
        limit: 30,
        search,
        direction,
        paymentType
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useCreateInventoryRecord = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createInventoryRecord,
    onSuccess: (data, variables) => {
      toast.success('Movimiento de inventario registrado exitosamente!')
      rememberMovements(
        queryClient,
        recordsFromCreate(queryClient, data, variables)
      )
      invalidateStockQueries(queryClient)
    },
    onError: (error) => notifyError(error, 'Error al registrar el movimiento')
  })
  return mutation
}

// Registra el carrito completo (varios movimientos) en una sola petición
export const useCreateInventoryRecords = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createInventoryRecords,
    onSuccess: (data, variables) => {
      const count = Array.isArray(data) ? data.length : 0
      toast.success(
        `${count} movimiento(s) de inventario registrados exitosamente!`
      )
      rememberMovements(
        queryClient,
        recordsFromCreate(queryClient, data, variables)
      )
      invalidateStockQueries(queryClient)
    },
    onError: (error) => notifyError(error, 'Error al registrar los movimientos')
  })
  return mutation
}

export const useUpdateInventoryRecord = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: updateInventoryRecord,
    onSuccess: (data, variables) => {
      toast.success('Movimiento actualizado exitosamente!')
      rememberUpdate(queryClient, data, variables)
      invalidateStockQueries(queryClient)
    },
    onError: (error) => notifyError(error, 'Error al actualizar el movimiento')
  })
  return mutation
}

export const useDeleteInventoryRecord = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: deleteInventoryRecord,
    onSuccess: (_result, id) => {
      toast.success('Movimiento eliminado. El inventario fue actualizado.', {
        duration: 5000
      })
      const previous = findCachedRecord(queryClient, id)
      if (previous) {
        eachList(queryClient, (current) => removeInventoryRecord(current, id))
        applyStockToCatalog(queryClient, {
          [idOf(previous.productName)]: -stockDelta(
            previous.typeInventory?.stockDirection,
            previous.quantity
          )
        })
      }
      invalidateStockQueries(queryClient)
    },
    onError: (error) => notifyError(error, 'Error al eliminar el movimiento')
  })
  return mutation
}

// Reportes
export const useGetLowStockProductPages = (search = '', category = '') =>
  useInfiniteQuery({
    queryKey: ['LowStockProducts', 'pages', search, category],
    queryFn: ({ pageParam }) =>
      getLowStockProductsPage({
        page: pageParam,
        limit: 20,
        search,
        category
      }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useGetSalesByDateRangePages = (
  startDate,
  endDate,
  type = '',
  paymentType = '',
  enabled = true
) =>
  useInfiniteQuery({
    queryKey: [
      'SalesByDateRange',
      'pages',
      startDate,
      endDate,
      type,
      paymentType
    ],
    queryFn: ({ pageParam }) =>
      getSalesByDateRangePage({
        startDate,
        endDate,
        page: pageParam,
        limit: 20,
        ...(type && { type }),
        ...(paymentType && { paymentType })
      }),
    // Conserva la respuesta anterior para no desmontar la pantalla. La vista
    // no pinta esas filas: solo sostiene el alto mientras llega el filtro nuevo.
    placeholderData: keepPreviousData,
    enabled: enabled && !!(startDate && endDate && startDate <= endDate),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useGetInventoryStats = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['InventoryStats'],
    queryFn: getInventoryStats,
    staleTime: 5 * 60 * 1000
  })
  return { data, isLoading, isError }
}

export const useGetLiveInformation = (date) =>
  useQuery({
    queryKey: ['LiveInformation', date],
    queryFn: () => getLiveInformation(date),
    enabled: Boolean(date),
    staleTime: 5 * 60 * 1000
  })
