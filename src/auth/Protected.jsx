import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { decodedValid } from '../utils/formatedDate'
import { jwtDecode } from 'jwt-decode'

const Protected = () => {
  const auth = useAuthStore((state) => state.auth)
  const logOut = useAuthStore((state) => state.logOut)

  if (!auth) {
    return <Navigate to="/" />
  }

  try {
    const isExpired = decodedValid() >= jwtDecode(auth).exp * 1000
    if (isExpired) {
      logOut()
      return <Navigate to="/" replace />
    }
    return <Outlet />
  } catch {
    logOut()
    return <Navigate to="/" replace />
  }
}

export default Protected
