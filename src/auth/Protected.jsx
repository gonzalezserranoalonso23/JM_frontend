import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

const Protected = ({ adminOnly = false }) => {
  const auth = useAuthStore((state) => state.auth)
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (!auth) {
    return <Navigate to="/" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}

export default Protected
