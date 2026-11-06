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
  const setRole = useAuthStore((state) => state.setRole)

  const mutationLogin = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      toast.success('Inicio de sesión exitoso! ')
      auth(data.data.token)
      profile(data.data.username)
      setRole(data.data.role || '')
      navigate('../home')
    },
    onError: (error) => notifyError(error, 'Error al iniciar sesión!')
  })
  return mutationLogin
}

export const useGetAssignableUsers = () =>
  useQuery({
    queryKey: ['Users', 'assignable'],
    queryFn: getAssignableUsers
  })

export const useGetCurrentUser = (enabled = true) => {
  const role = useAuthStore((state) => state.role)
  const setRole = useAuthStore((state) => state.setRole)
  const query = useQuery({
    queryKey: ['users', 'me'],
    queryFn: getCurrentUser,
    enabled
  })
  const roleName = query.data?.role?.name || ''

  useEffect(() => {
    if (roleName && roleName !== role) setRole(roleName)
  }, [roleName, role, setRole])

  return query
}

export const useRoleName = () => {
  const role = useAuthStore((state) => state.role)
  const { data: me } = useGetCurrentUser()
  return role || me?.role?.name || ''
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
