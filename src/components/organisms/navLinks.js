import { canVisit, hasFullAccess } from '@/auth/access'

const STAFF_LINKS = [
  { to: '/home', label: 'Inicio', end: true },
  { to: '/attendance', label: 'Asistencias' },
  { to: '/issues', label: 'Salidas' },
  { to: '/entries', label: 'Entradas' },
  { to: '/todolist', label: 'Pendientes', badge: true },
  { to: '/products', label: 'Productos' },
  { to: '/suppliers', label: 'Proveedores' }
]

const LIMITED_LINKS = STAFF_LINKS.filter(
  (link) =>
    link.to !== '/issues' && link.to !== '/entries' && link.to !== '/todolist'
)

const LIMITED_PRIMARY = LIMITED_LINKS.map((link) => link.to)

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
      { to: '/attendance', label: 'Asistencias' },
      { to: '/low-stock', label: 'Bajo stock' }
    ]
  },
  { to: '/daily-information', label: 'Información diaria' },
  { to: '/promotions', label: 'Promociones' },
  { to: '/cash', label: 'Caja' },
  { to: '/catalogs', label: 'Catálogo' }
]

const allowLink = (link, roleName) => {
  if (link.children) {
    const children = link.children.filter((child) =>
      canVisit(roleName, child.to)
    )
    if (!children.length) return null
    return { ...link, children }
  }
  if (!link.to || canVisit(roleName, link.to)) return link
  return null
}

export const getNavLinks = (roleName = '', haveSchedule = false) => {
  let links
  if (roleName === 'Staff') links = STAFF_LINKS
  else if (!hasFullAccess(roleName)) links = LIMITED_LINKS
  else
    links = ADMIN_LINKS.map((link) => allowLink(link, roleName)).filter(Boolean)

  if (!hasFullAccess(roleName) && !haveSchedule) {
    return links.filter((link) => link.to !== '/attendance')
  }
  return links
}

const wideNav = (roleName) => hasFullAccess(roleName) || roleName === 'Staff'

export const desktopLinkAlignment = (roleName = '') => {
  if (wideNav(roleName)) return 'justify-evenly'
  return 'justify-end'
}

export const PRIMARY_TABS = ['/home', '/issues', '/entries', '/todolist']

export const splitMobileTabs = (links, roleName = '') => {
  if (roleName === 'Staff') {
    return {
      primary: links.filter((link) => PRIMARY_TABS.includes(link.to)),
      moreLinks: links.filter(
        (link) => link.to && !PRIMARY_TABS.includes(link.to)
      )
    }
  }
  if (!wideNav(roleName)) {
    return {
      primary: links.filter((link) => LIMITED_PRIMARY.includes(link.to)),
      moreLinks: links.filter(
        (link) => link.to && !LIMITED_PRIMARY.includes(link.to)
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
