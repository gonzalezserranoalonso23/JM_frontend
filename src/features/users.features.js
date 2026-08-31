import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import {
  login,
  getUsers,
  registerUser,
  updateUser,
  deleteUser
} from '@/services/users.services'
import { useNavigate } from 'react-router-dom'

export const useLogin = () => {
  const navigate = useNavigate()
  const auth = useAuthStore((state) => state.setAuth)
  const profile = useAuthStore((state) => state.setProfile)
  const isAdmin = useAuthStore((state) => state.setIsAdmin)

  const mutationLogin = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      toast.success('Inicio de sesión exitoso! ')
      auth(data.data.token)
      profile(data.data.username)
      isAdmin(data.data.isAdmin)
      navigate('../home')
    },
    onError: () => toast.error('Error al iniciar sesión!')
  })
  return mutationLogin
}

export const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  })
}

export const useRegisterUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Usuario registrado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Error al registrar el usuario'
      )
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
      toast.error(
        error.response?.data?.message || 'Error al actualizar el usuario'
      )
    }
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Usuario eliminado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Error al eliminar el usuario'
      )
    }
  })
}
