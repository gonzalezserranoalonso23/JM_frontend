import { useQuery } from '@tanstack/react-query'
import { getPaymentTypes } from '@/services/paymentTypes.services'

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
