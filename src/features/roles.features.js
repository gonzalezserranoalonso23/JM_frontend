import { useQuery } from '@tanstack/react-query'
import { getRoles } from '@/services/roles.services'

export const useGetRoles = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['Roles'],
    queryFn: getRoles,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  })
  return { data: data ?? [], isLoading, isError }
}
