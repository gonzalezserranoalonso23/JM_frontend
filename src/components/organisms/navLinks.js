import { canVisit, hasFullAccess } from '@/auth/access'
import {
  Banknote,
  CalendarDays,
  ChartColumn,
  Clock3,
  House,
  ListTodo,
  Package,
  PackageSearch,
  Tags,
  Truck,
  UsersRound
} from 'lucide-react'

export const NAV_ICONS = {
  '/attendance': Clock3,
  '/products': Package,
  '/suppliers': Truck,
  '/daily-information': CalendarDays,
  '/home': House,
  '/reports': ChartColumn,
  '/low-stock': PackageSearch,
  '/catalogs': Tags,
  '/cash': Banknote,
  '/todolist': ListTodo,
  '/users': UsersRound
}

const STAFF_LINKS = [
  { to: '/home', label: 'Inicio', end: true },
  { to: '/todolist', label: 'Pendientes', badge: true },
  { to: '/daily-information', label: 'Información' },
  { to: '/attendance', label: 'Asistencias' },
  { to: '/products', label: 'Productos' },
  { to: '/suppliers', label: 'Proveedores' },
  { to: '/cash', label: 'Caja' }
]

const LIMITED_LINKS = STAFF_LINKS

const LIMITED_PRIMARY = [
  '/home',
  '/todolist',
  '/daily-information',
  '/products'
]

const ADMIN_LINKS = [
  { to: '/home', label: 'Inicio', end: true },
  { to: '/todolist', label: 'Pendientes', badge: true },
  { to: '/daily-information', label: 'Información' },
  { to: '/products', label: 'Productos' },
  { to: '/suppliers', label: 'Proveedores' },
  { to: '/cash', label: 'Caja' },
  { to: '/users', label: 'Usuarios' },
  {
    label: 'Reportes',
    icon: NAV_ICONS['/reports'],
    children: [
      { to: '/reports', label: 'Ventas' },
      { to: '/attendance', label: 'Asistencias' }
    ]
  }
]

const allowLink = (link, isAdmin) => {
  if (link.children) {
    const children = link.children.filter((child) =>
      canVisit(isAdmin, child.to)
    )
    if (!children.length) return null
    return { ...link, children }
  }
  if (!link.to || canVisit(isAdmin, link.to)) return link
  return null
}

export const getNavLinks = (isAdmin = false, haveSchedule = false) => {
  const links = hasFullAccess(isAdmin)
    ? ADMIN_LINKS.map((link) => allowLink(link, isAdmin)).filter(Boolean)
    : LIMITED_LINKS

  if (!hasFullAccess(isAdmin) && !haveSchedule) {
    return links.filter((link) => link.to !== '/attendance')
  }
  return links
}

const wideNav = (isAdmin) => hasFullAccess(isAdmin)

export const desktopLinkAlignment = (isAdmin = false) => {
  if (wideNav(isAdmin)) return 'justify-evenly'
  return 'justify-end'
}

export const PRIMARY_TABS = [
  '/home',
  '/todolist',
  '/daily-information',
  '/products',
]

export const splitMobileTabs = (links, isAdmin = false) => {
  if (!wideNav(isAdmin)) {
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
  const columnCount = primaryCount + (hasMore ? 1 : 0)
  return TAB_COLUMNS[columnCount] || TAB_COLUMNS[3]
}

export const isNavPathActive = (pathname, to, end) => {
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}
