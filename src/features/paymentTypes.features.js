import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { notifyError } from '@/libs/handleErrors'
import {
  createPaymentType,
  deletePaymentType,
  getPaymentTypes,
  updatePaymentType
} from '@/services/paymentTypes.services'

// Catálogo casi estático: se cachea 1 hora. label = nombre, value = _id.
export const useGetPaymentTypes = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['PaymentTypes'],
    queryFn: getPaymentTypes,
    staleTime: 60 * 60 * 1000,
    select: (types) =>
      types.map(({ _id, paymentType }) => ({ value: _id, label: paymentType }))
  })
  return { data: data ?? [], isLoading, isError }
}

const usePaymentTypeMutation = (mutationFn, message) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onError: (error) =>
      notifyError(error, 'No se pudo completar la operación'),
    onSuccess: () => {
      toast.success(message)
      queryClient.invalidateQueries({ queryKey: ['PaymentTypes'] })
      queryClient.invalidateQueries({ queryKey: ['InventoryRecords'] })
    }
  })
}

export const useCreatePaymentType = () =>
  usePaymentTypeMutation(createPaymentType, 'Método de pago creado!')

export const useUpdatePaymentType = () =>
  usePaymentTypeMutation(updatePaymentType, 'Método de pago actualizado!')

export const useDeletePaymentType = () =>
  usePaymentTypeMutation(deletePaymentType, 'Método de pago borrado!')
