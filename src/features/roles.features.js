import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { compareRoles } from '@/auth/access'
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole
} from '@/services/roles.services'

export const useGetRoles = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['Roles'],
    queryFn: getRoles,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  })
  const roles = [...(data ?? [])].sort((left, right) =>
    compareRoles(left?.name, right?.name)
  )
  return { data: roles, isLoading, isError }
}

const refreshRoles = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['Roles'] })
}

export const useCreateRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success('Rol creado')
      refreshRoles(queryClient)
    }
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      toast.success('Rol actualizado')
      refreshRoles(queryClient)
    }
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success('Rol eliminado')
      refreshRoles(queryClient)
    }
  })
}
