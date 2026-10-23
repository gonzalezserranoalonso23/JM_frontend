import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getInventoryRecord,
  getInventoryRecordsPage,
  createInventoryRecord,
  createInventoryRecords,
  updateInventoryRecord,
  deleteInventoryRecord,
  getLowStockProductsPage,
  getSalesByDateRangePage,
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
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

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
    // Sin placeholderData: al cambiar de tipo no deben verse filas del filtro anterior
    enabled: enabled && !!(startDate && endDate && startDate <= endDate),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useGetInventoryStats = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['InventoryStats'],
    queryFn: getInventoryStats
  })
  return { data, isLoading, isError }
}
