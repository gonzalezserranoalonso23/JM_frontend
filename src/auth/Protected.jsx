import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { canVisit, sessionRole } from '@/auth/access'
import { useGetCurrentUser } from '@/features/users.features'
import { useAppState } from '@/store/appState'
import { useAuthStore } from '@/store/auth'

const Protected = () => {
  const auth = useAuthStore((state) => state.auth)
  const role = useAuthStore((state) => state.role)
  const shutdown = useAppState((state) => state.shutdown)
  const { pathname } = useLocation()
  const { data: me, isLoading } = useGetCurrentUser(Boolean(auth) && !shutdown)
  const roleName = sessionRole(role, me)

  if (shutdown || !auth) {
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
