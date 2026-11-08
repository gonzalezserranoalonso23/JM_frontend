export const hasFullAccess = (role) =>
  role === 'Manager' || role === 'Supervisor'

const STAFF_PATHS = [
  '/home',
  '/issues',
  '/entries',
  '/todolist',
  '/cash',
  '/products',
  '/suppliers'
]

const USER_PATHS = ['/home', '/todolist', '/products', '/suppliers', '/cash']

const matchesPath = (pathname, paths) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

export const canVisit = (role, pathname) => {
  if (pathname === '/home') return true
  if (role === 'Manager' || role === 'Supervisor') return true
  if (role === 'Staff') return matchesPath(pathname, STAFF_PATHS)
  if (role === 'User') return matchesPath(pathname, USER_PATHS)
  return false
}
