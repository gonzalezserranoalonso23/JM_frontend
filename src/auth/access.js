export const hasFullAccess = (role) =>
  role === 'Sudo' || role === 'Manager' || role === 'Supervisor'

export const isSudo = (role) => role === 'Sudo'

const ASSIGNABLE_ROLES = {
  Sudo: ['Sudo', 'Manager', 'Supervisor', 'Staff', 'User'],
  Manager: ['Manager', 'Supervisor', 'Staff', 'User'],
  Supervisor: ['Supervisor', 'Staff', 'User']
}

export const SCHEDULE_ROLES = ['Supervisor', 'Staff', 'User']

export const rolesAssignableBy = (actor) => ASSIGNABLE_ROLES[actor] || []

export const keepsSchedule = (role) => SCHEDULE_ROLES.includes(role)

const ROLE_RANK = ['User', 'Staff', 'Supervisor', 'Manager', 'Sudo']

export const compareRoles = (left, right) => {
  const rank = (name) => {
    const index = ROLE_RANK.indexOf(name)
    return index === -1 ? ROLE_RANK.length : index
  }
  return rank(left) - rank(right)
}

export const ADMIN_ROLES = ['Sudo', 'Manager', 'Supervisor']
export const STAFF_ROLES = ['Sudo', 'Manager', 'Supervisor', 'Staff']
export const USER_ROLES = ['Sudo', 'Manager', 'Supervisor', 'Staff', 'User']

// The signed-in role from the server wins once it has arrived.
export const sessionRole = (storeRole, me) => me?.role?.name || storeRole || ''

export const routeRules = [
  { path: '/home', roles: USER_ROLES },
  { path: '/todolist', roles: ADMIN_ROLES },
  { path: '/products', roles: USER_ROLES },
  { path: '/suppliers', roles: USER_ROLES },
  { path: '/cash', roles: ADMIN_ROLES },
  { path: '/issues', roles: STAFF_ROLES },
  { path: '/issues/:id', roles: STAFF_ROLES },
  { path: '/entries', roles: STAFF_ROLES },
  { path: '/entries/:id', roles: STAFF_ROLES },
  { path: '/orders', roles: ADMIN_ROLES },
  { path: '/reports', roles: ADMIN_ROLES },
  { path: '/attendance', roles: ADMIN_ROLES },
  { path: '/low-stock', roles: ADMIN_ROLES },
  { path: '/daily-information', roles: ADMIN_ROLES },
  { path: '/promotions', roles: ADMIN_ROLES },
  { path: '/catalogs', roles: ADMIN_ROLES },
  { path: '/categories', roles: ADMIN_ROLES },
  { path: '/payment-types', roles: ADMIN_ROLES },
  { path: '/roles', roles: ['Sudo'] },
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
