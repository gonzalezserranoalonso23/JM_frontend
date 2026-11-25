export const hasFullAccess = (isAdmin) => isAdmin === true

export const sessionRole = (storeIsAdmin, me) =>
  typeof me?.isAdmin === 'boolean' ? me.isAdmin : Boolean(storeIsAdmin)

export const routeRules = [
  { path: '/home' },
  { path: '/products' },
  { path: '/suppliers' },
  { path: '/cash' },
  { path: '/reports', adminOnly: true },
  { path: '/attendance' },
  { path: '/daily-information' },
  { path: '/todolist' },
  { path: '/users', adminOnly: true }
]

export const matchRoute = (pathname) =>
  routeRules.find((rule) => rule.path === pathname)

export const canVisit = (isAdmin, pathname) => {
  const rule = matchRoute(pathname)
  if (typeof isAdmin !== 'boolean' || !rule) return false
  return !rule.adminOnly || hasFullAccess(isAdmin)
}
