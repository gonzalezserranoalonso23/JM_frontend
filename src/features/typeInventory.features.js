import { useQuery } from '@tanstack/react-query'
import { getTypeInventories } from '@/services/typeInventory.services'

// Nearly static catalog, cached for 1 hour. stockDirection says whether the
// type adds stock (entry, 1) or subtracts it (exit, -1). The name is only a label.
export const useGetTypeInventories = (enabled = true) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['TypeInventories'],
    queryFn: getTypeInventories,
    enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    select: (types) =>
      types.map(({ _id, typeInventory, stockDirection }) => ({
        value: _id,
        label: typeInventory,
        stockDirection: Number(stockDirection)
      }))
  })
  const types = data ?? []
  return {
    types,
    entryType: types.find((type) => type.stockDirection === 1),
    issueType: types.find((type) => type.stockDirection === -1),
    isLoading,
    isError
  }
}
