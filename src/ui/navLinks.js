const STAFF_LINKS = [
  { to: '/home', label: 'Inicio', end: true },
  { to: '/attendance', label: 'Asistencia' },
  { to: '/issues', label: 'Salidas' },
  { to: '/entries', label: 'Entradas' },
  { to: '/orders', label: 'Órdenes' },
  { to: '/todolist', label: 'Pendientes', badge: true },
  { to: '/suppliers', label: 'Proveedores' },
  { to: '/products', label: 'Productos' }
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
  { to: '/shortages', label: 'Faltantes' },
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
  const links = isAdmin ? ADMIN_LINKS : STAFF_LINKS
  return showAttendance ? links : withoutAttendance(links)
}

export const PRIMARY_TABS = ['/home', '/issues', '/entries', '/todolist']

export const isNavPathActive = (pathname, to, end) =>
  end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
