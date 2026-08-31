import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

const Protected = () => {
  const auth = useAuthStore((state) => state.auth)

  if (!auth) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default Protected
