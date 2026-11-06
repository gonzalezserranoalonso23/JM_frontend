import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { canVisit } from '@/auth/access'
import { useGetCurrentUser } from '@/features/users.features'
import { useAuthStore } from '@/store/auth'

const Protected = () => {
  const auth = useAuthStore((state) => state.auth)
  const role = useAuthStore((state) => state.role)
  const { pathname } = useLocation()
  const { data: me, isLoading } = useGetCurrentUser(Boolean(auth))
  const roleName = role || me?.role?.name || ''

  if (!auth) {
    return <Navigate to="/" replace />
  }

  if (!roleName) {
    if (isLoading) return null
    if (pathname === '/home') return <Outlet />
    return <Navigate to="/home" replace />
  }

  if (!canVisit(roleName, pathname)) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}

export default Protected
