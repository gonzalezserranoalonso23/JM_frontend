import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/auth'
import { login } from '../services/users.services'
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
