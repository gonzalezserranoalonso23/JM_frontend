const STAFF_LINKS = [
  { to: '/home', label: 'Inicio', end: true },
  { to: '/products', label: 'Productos' },
  { to: '/suppliers', label: 'Proveedores' },
  { to: '/cash', label: 'Caja' }
]

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
      { to: '/attendance', label: 'Asistencia' }
    ]
  },
  { to: '/daily-information', label: 'Información diaria' },
  { to: '/promotions', label: 'Promociones' },
  { to: '/cash', label: 'Caja' },
  { to: '/catalogs', label: 'Catálogo' }
]

const withoutAttendance = (links) =>
  links
    .filter((link) => link.to !== '/attendance')
    .map((link) =>
      link.children
        ? {
            ...link,
            children: link.children.filter((child) => child.to !== '/attendance')
          }
        : link
    )

export const getNavLinks = (isAdmin, showAttendance = false) => {
  if (!isAdmin) return STAFF_LINKS
  if (showAttendance) return ADMIN_LINKS
  return withoutAttendance(ADMIN_LINKS)
}

export const desktopLinkAlignment = (isAdmin) => {
  if (isAdmin) return 'justify-evenly'
  return 'justify-end'
}

export const PRIMARY_TABS = ['/home', '/issues', '/entries', '/todolist']

export const splitMobileTabs = (links, isAdmin) => {
  if (!isAdmin) {
    return { primary: links.filter((link) => link.to), moreLinks: [] }
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
