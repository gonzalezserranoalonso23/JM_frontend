export const getNavLinks = (isAdmin) =>
  [
    { to: '/home', label: 'Inicio', end: true },
    { to: '/issues', label: 'Salidas' },
    { to: '/entries', label: 'Entradas' },
    { to: '/orders', label: 'Órdenes' },
    { to: '/todolist', label: 'Pendientes', badge: true },
    { to: '/reports', label: 'Reportes' },
    {
      to: '/daily-information',
      label: 'Información diaria',
      adminOnly: true
    },
    { to: '/shortages', label: 'Faltantes' },
    { to: '/cash', label: 'Caja' },
    { to: '/catalogs', label: 'Catálogo' }
  ].filter((link) => isAdmin || !link.adminOnly)

export const PRIMARY_TABS = ['/home', '/issues', '/entries', '/todolist']
