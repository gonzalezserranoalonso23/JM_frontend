import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { notifyError } from '@/libs/handleErrors'
import {
  getOrderRequestsPage,
  createOrderRequest,
  updateOrderRequest,
  deleteOrderRequest
} from '@/services/orders.services'

export const useGetOrderPages = (search = '') =>
  useInfiniteQuery({
    queryKey: ['OrderRequests', 'pages', search],
    queryFn: ({ pageParam, signal }) =>
      getOrderRequestsPage({ page: pageParam, limit: 20, search, signal }),
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useCreateOrderRequest = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createOrderRequest,
    onSuccess: () => {
      toast.success('Solicitud de pedido creada!')
      queryClient.invalidateQueries({ queryKey: ['OrderRequests'] })
    },
    onError: (error) => notifyError(error, 'Error al crear solicitud')
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
    },
    onError: (error) => notifyError(error, 'Error al actualizar solicitud')
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
