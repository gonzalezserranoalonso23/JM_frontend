export const hasFullAccess = (role) =>
  role === 'Manager' || role === 'Supervisor'

export const ADMIN_ROLES = ['Manager', 'Supervisor']
export const STAFF_ROLES = ['Manager', 'Supervisor', 'Staff']
export const USER_ROLES = ['Manager', 'Supervisor', 'Staff', 'User']

// El rol del usuario en sesión manda cuando ya llegó del servidor.
export const sessionRole = (storeRole, me) => me?.role?.name || storeRole || ''

export const routeRules = [
  { path: '/home', roles: USER_ROLES },
  { path: '/todolist', roles: USER_ROLES },
  { path: '/products', roles: USER_ROLES },
  { path: '/suppliers', roles: USER_ROLES },
  { path: '/cash', roles: USER_ROLES },
  { path: '/issues', roles: STAFF_ROLES },
  { path: '/issues/:id', roles: STAFF_ROLES },
  { path: '/entries', roles: STAFF_ROLES },
  { path: '/entries/:id', roles: STAFF_ROLES },
  { path: '/orders', roles: ADMIN_ROLES },
  { path: '/reports', roles: ADMIN_ROLES },
  { path: '/attendance', roles: ADMIN_ROLES },
  { path: '/daily-information', roles: ADMIN_ROLES },
  { path: '/promotions', roles: ADMIN_ROLES },
  { path: '/catalogs', roles: ADMIN_ROLES },
  { path: '/categories', roles: ADMIN_ROLES },
  { path: '/payment-types', roles: ADMIN_ROLES },
  { path: '/users', roles: ADMIN_ROLES }
]

const patternToRegExp = (path) =>
  new RegExp(`^${path.replace(/:[^/]+/g, '[^/]+')}$`)

export const matchRoute = (pathname) =>
  routeRules.find((rule) =>
    rule.path.includes(':')
      ? patternToRegExp(rule.path).test(pathname)
      : pathname === rule.path
  )

export const canVisit = (role, pathname) => {
  if (pathname === '/home') return true
  const rule = matchRoute(pathname)
  if (!rule) return hasFullAccess(role)
  if (!role) return false
  return rule.roles.includes(role)
}
