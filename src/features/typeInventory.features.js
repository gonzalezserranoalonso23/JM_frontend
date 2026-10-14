import { useQuery } from '@tanstack/react-query'
import { getTypeInventories } from '@/services/typeInventory.services'

// Catálogo casi estático (1 hora). La dirección del stock define si el tipo
// suma (entrada, 1) o resta (salida, -1); el nombre es solo una etiqueta.
export const useGetTypeInventories = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['TypeInventories'],
    queryFn: getTypeInventories,
    staleTime: 60 * 60 * 1000,
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
