import { useEffect } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { notifyError } from '@/libs/handleErrors'
import { useAuthStore } from '@/store/auth'
import {
  login,
  getUsersPage,
  getAssignableUsers,
  getCurrentUser,
  registerUser,
  updateUser,
  deleteUser,
  revokeUserSessions
} from '@/services/users.services'
import { useNavigate } from 'react-router-dom'

export const useLogin = () => {
  const navigate = useNavigate()
  const auth = useAuthStore((state) => state.setAuth)
  const profile = useAuthStore((state) => state.setProfile)
  const setIsAdmin = useAuthStore((state) => state.setIsAdmin)

  const mutationLogin = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      toast.success('Inicio de sesión exitoso! ')
      auth(data.data.token)
      profile(data.data.username)
      setIsAdmin(data.data.isAdmin)
      navigate('../home')
    },
    onError: (error) => notifyError(error, 'Error al iniciar sesión!')
  })
  return mutationLogin
}

export const useGetAssignableUsers = (enabled = true) =>
  useQuery({
    queryKey: ['Users', 'assignable'],
    queryFn: getAssignableUsers,
    enabled,
    staleTime: 10 * 60 * 1000
  })

export const useGetCurrentUser = (enabled = true) => {
  const setIsAdmin = useAuthStore((state) => state.setIsAdmin)
  const query = useQuery({
    queryKey: ['users', 'me'],
    queryFn: getCurrentUser,
    enabled,
    staleTime: 30 * 1000
  })
  const isAdmin = query.data?.isAdmin

  useEffect(() => {
    if (typeof isAdmin === 'boolean') setIsAdmin(isAdmin)
  }, [isAdmin, setIsAdmin])

  return query
}

export const useIsAdmin = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const { data: me } = useGetCurrentUser()
  const current = typeof me?.isAdmin === 'boolean' ? me.isAdmin : isAdmin
  return Boolean(current)
}

export const useGetUserPages = (search = '') =>
  useInfiniteQuery({
    queryKey: ['users', 'pages', search],
    queryFn: ({ pageParam }) =>
      getUsersPage({ page: pageParam, limit: 20, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useRegisterUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Usuario registrado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      notifyError(error, 'Error al registrar el usuario')
    }
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      toast.success('Usuario actualizado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      notifyError(error, 'Error al actualizar el usuario')
    }
  })
}

export const useRevokeUserSessions = () =>
  useMutation({
    mutationFn: revokeUserSessions,
    onSuccess: () => {
      toast.success('Sesiones cerradas')
    },
    onError: (error) => {
      notifyError(error, 'Error al cerrar las sesiones')
    }
  })

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Usuario eliminado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      notifyError(error, 'Error al eliminar el usuario')
    }
  })
}
