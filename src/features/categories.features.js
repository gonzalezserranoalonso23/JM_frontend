import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/services/categories.services'

export const useGetCategories = () =>
  useQuery({
    queryKey: ['Categories'],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000
  })
