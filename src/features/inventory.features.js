import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { notifyError } from '@/libs/handleErrors'
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

// Un movimiento cambia el stock de los productos y los reportes derivados
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
    onError: (error) =>
      notifyError(error, 'Error al registrar el movimiento')
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
    onError: (error) =>
      notifyError(error, 'Error al registrar los movimientos')
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
    onError: (error) =>
      notifyError(error, 'Error al actualizar el movimiento')
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
    onError: (error) =>
      notifyError(error, 'Error al eliminar el movimiento')
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
    queryFn: getInventoryStats
  })
  return { data, isLoading, isError }
}

export const useGetLiveInformation = (date) =>
  useQuery({
    queryKey: ['LiveInformation', date],
    queryFn: () => getLiveInformation(date),
    enabled: Boolean(date)
  })
