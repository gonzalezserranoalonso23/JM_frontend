import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { canVisit, sessionRole } from '@/auth/access'
import { useGetCurrentUser } from '@/features/users.features'
import { useAuthStore } from '@/store/auth'

const Protected = () => {
  const auth = useAuthStore((state) => state.auth)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const { pathname } = useLocation()
  const { data: me, isLoading } = useGetCurrentUser(Boolean(auth))
  const admin = sessionRole(isAdmin, me)

  if (!auth) {
    return <Navigate to="/" replace />
  }

  if (typeof admin !== 'boolean') {
    if (isLoading) return null
    if (pathname === '/home') return <Outlet />
    return <Navigate to="/home" replace />
  }

  if (!canVisit(admin, pathname)) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}

export default Protected
