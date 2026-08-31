import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getInventoryRecords,
  getInventoryRecord,
  createInventoryRecord,
  updateInventoryRecord,
  deleteInventoryRecord,
  getDailySalesSummary,
  getLowStockProducts,
  getSalesByDateRange,
  getInventoryByType,
  getInventoryStats
} from '@/services/inventory.services'

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
      queryClient.invalidateQueries({ queryKey: ['InventoryRecords'] })
      queryClient.invalidateQueries({ queryKey: ['InventoryStats'] })
      queryClient.invalidateQueries({ queryKey: ['LowStockProducts'] })
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Error al registrar el movimiento'
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
      queryClient.invalidateQueries({ queryKey: ['InventoryRecords'] })
      queryClient.invalidateQueries({ queryKey: ['InventoryStats'] })
    }
  })
  return mutation
}

export const useDeleteInventoryRecord = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: deleteInventoryRecord,
    onSuccess: () => {
      toast.success('Movimiento eliminado exitosamente!')
      queryClient.invalidateQueries({ queryKey: ['InventoryRecords'] })
      queryClient.invalidateQueries({ queryKey: ['InventoryStats'] })
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

export const useGetSalesByDateRange = (startDate, endDate) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['SalesByDateRange', startDate, endDate],
    queryFn: () => getSalesByDateRange(startDate, endDate),
    enabled: !!(startDate && endDate)
  })
  return { data, isLoading, isError }
}

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
