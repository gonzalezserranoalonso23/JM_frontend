import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getInventoryRecords,
  getInventoryRecord,
  createInventoryRecord,
  createInventoryRecords,
  updateInventoryRecord,
  deleteInventoryRecord,
  getDailySalesSummary,
  getLowStockProducts,
  getLowStockProductsPage,
  getSalesByDateRange,
  getSalesByDateRangePage,
  getInventoryByType,
  getInventoryStats
} from '@/services/inventory.services'

// Un movimiento cambia el stock de los productos y los reportes derivados
const invalidateStockQueries = (queryClient) => {
  for (const key of [
    'InventoryRecords',
    'InventoryStats',
    'LowStockProducts',
    'Products'
  ]) {
    queryClient.invalidateQueries({ queryKey: [key] })
  }
}

// Registros
export const useGetInventoryRecords = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['InventoryRecords'],
    queryFn: getInventoryRecords
  })
  return { data, isLoading, isError }
}

export const useGetInventoryRecord = (id) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['InventoryRecord', id],
    queryFn: () => getInventoryRecord(id)
  })
  return { data, isLoading, isError }
}

export const useCreateInventoryRecord = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createInventoryRecord,
    onSuccess: () => {
      toast.success('Movimiento de inventario registrado exitosamente!')
      invalidateStockQueries(queryClient)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Error al registrar el movimiento'
      toast.error(message)
    }
  })
  return mutation
}

// Registra el carrito completo (varios movimientos) en una sola petición
export const useCreateInventoryRecords = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createInventoryRecords,
    onSuccess: (data) => {
      toast.success(
        `${data.length} movimiento(s) de inventario registrados exitosamente!`
      )
      invalidateStockQueries(queryClient)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Error al registrar los movimientos'
      toast.error(message)
    }
  })
  return mutation
}

export const useUpdateInventoryRecord = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: updateInventoryRecord,
    onSuccess: () => {
      toast.success('Movimiento actualizado exitosamente!')
      invalidateStockQueries(queryClient)
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Error al actualizar el movimiento'
      )
    }
  })
  return mutation
}

export const useDeleteInventoryRecord = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: deleteInventoryRecord,
    onSuccess: () => {
      toast.success('Movimiento eliminado. El inventario fue actualizado.', {
        duration: 5000
      })
      invalidateStockQueries(queryClient)
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Error al eliminar el movimiento'
      )
    }
  })
  return mutation
}

// Reportes
export const useGetDailySalesSummary = (date) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['DailySalesSummary', date],
    queryFn: () => getDailySalesSummary(date)
  })
  return { data, isLoading, isError }
}

export const useGetLowStockProducts = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['LowStockProducts'],
    queryFn: getLowStockProducts
  })
  return { data, isLoading, isError }
}

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
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useGetSalesByDateRange = (startDate, endDate) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['SalesByDateRange', startDate, endDate],
    queryFn: () => getSalesByDateRange(startDate, endDate),
    enabled: !!(startDate && endDate)
  })
  return { data, isLoading, isError }
}

export const useGetSalesByDateRangePages = (
  startDate,
  endDate,
  type = '',
  paymentType = ''
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
    enabled: !!(startDate && endDate && startDate <= endDate),
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useGetInventoryByType = (type) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['InventoryByType', type],
    queryFn: () => getInventoryByType(type),
    enabled: !!type
  })
  return { data, isLoading, isError }
}

export const useGetInventoryStats = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['InventoryStats'],
    queryFn: getInventoryStats
  })
  return { data, isLoading, isError }
}
