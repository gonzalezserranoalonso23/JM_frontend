import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getOrderRequests,
  getOrderRequest,
  createOrderRequest,
  updateOrderRequest,
  deleteOrderRequest
} from '../services/orders.services'

export const useGetOrderRequests = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['OrderRequests'],
    queryFn: getOrderRequests
  })
  return { data, isLoading, isError }
}

export const useGetOrderRequest = (id) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['OrderRequest', id],
    queryFn: () => getOrderRequest(id),
    enabled: !!id
  })
  return { data, isLoading, isError }
}

export const useCreateOrderRequest = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createOrderRequest,
    onSuccess: () => {
      toast.success('Solicitud de pedido creada!')
      queryClient.invalidateQueries({ queryKey: ['OrderRequests'] })
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Error al crear solicitud'
      toast.error(message)
    }
  })
  return mutation
}

export const useUpdateOrderRequest = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: updateOrderRequest,
    onSuccess: () => {
      toast.success('Solicitud actualizada!')
      queryClient.invalidateQueries({ queryKey: ['OrderRequests'] })
    }
  })
  return mutation
}

export const useDeleteOrderRequest = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: deleteOrderRequest,
    onSuccess: () => {
      toast.success('Solicitud eliminada!')
      queryClient.invalidateQueries({ queryKey: ['OrderRequests'] })
    }
  })
  return mutation
}
