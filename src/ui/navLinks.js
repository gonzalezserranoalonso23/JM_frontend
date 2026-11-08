import { hasFullAccess } from '@/auth/access'

const USER_LINKS = [
  { to: '/home', label: 'Inicio', end: true },
  { to: '/todolist', label: 'Pendientes', badge: true },
  { to: '/products', label: 'Productos' },
  { to: '/suppliers', label: 'Proveedores' },
  { to: '/cash', label: 'Caja' }
]

const USER_PRIMARY = USER_LINKS.map((link) => link.to)

const ADMIN_LINKS = [
  { to: '/home', label: 'Inicio', end: true },
  { to: '/issues', label: 'Salidas' },
  { to: '/entries', label: 'Entradas' },
  { to: '/orders', label: 'Órdenes' },
  { to: '/todolist', label: 'Pendientes', badge: true },
  {
    label: 'Reportes',
    children: [
      { to: '/reports', label: 'Ventas' },
      { to: '/attendance', label: 'Asistencias' }
    ]
  },
  { to: '/daily-information', label: 'Información diaria' },
  { to: '/promotions', label: 'Promociones' },
  { to: '/cash', label: 'Caja' },
  { to: '/catalogs', label: 'Catálogo' }
]

const STAFF_HIDDEN = new Set([
  '/orders',
  '/daily-information',
  '/promotions',
  '/catalogs'
])

const staffRoleLinks = () => [
  ...ADMIN_LINKS.filter(
    (link) => link.label !== 'Reportes' && !STAFF_HIDDEN.has(link.to)
  ),
  { to: '/products', label: 'Producto' },
  { to: '/suppliers', label: 'Proveedores' }
]

export const getNavLinks = (roleName = '') => {
  if (roleName === 'Staff') return staffRoleLinks()
  if (!hasFullAccess(roleName)) return USER_LINKS
  return ADMIN_LINKS
}

const wideNav = (roleName) => hasFullAccess(roleName) || roleName === 'Staff'

export const desktopLinkAlignment = (roleName = '') => {
  if (wideNav(roleName)) return 'justify-evenly'
  return 'justify-end'
}

export const PRIMARY_TABS = ['/home', '/issues', '/entries', '/todolist']

export const splitMobileTabs = (links, roleName = '') => {
  if (!wideNav(roleName)) {
    return {
      primary: links.filter((link) => USER_PRIMARY.includes(link.to)),
      moreLinks: links.filter(
        (link) => link.to && !USER_PRIMARY.includes(link.to)
      )
    }
  }
  return {
    primary: links.filter((link) => link.to && PRIMARY_TABS.includes(link.to)),
    moreLinks: links.filter(
      (link) => !link.to || !PRIMARY_TABS.includes(link.to)
    )
  }
}

const TAB_COLUMNS = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5'
}

export const tabGridClass = (primaryCount, hasMore) => {
  if (hasMore) return TAB_COLUMNS[5]
  return TAB_COLUMNS[primaryCount] || TAB_COLUMNS[3]
}

export const isNavPathActive = (pathname, to, end) => {
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}
