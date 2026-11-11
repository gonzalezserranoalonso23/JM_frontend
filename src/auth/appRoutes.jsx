import { lazy } from 'react'
import { routeRules } from '@/auth/access'

const loaders = {
  '/home': () => import('@/pages/home/Home'),
  '/entries': () => import('@/pages/entries/Entries'),
  '/entries/:id': () => import('@/pages/entries/EntryDetails'),
  '/issues': () => import('@/pages/issues/Issues'),
  '/issues/:id': () => import('@/pages/issues/IssueDetails'),
  '/orders': () => import('@/pages/orders/Orders'),
  '/reports': () => import('@/pages/reports/Reports'),
  '/low-stock': () => import('@/pages/low-stock/LowStock'),
  '/todolist': () => import('@/pages/todolist/ToDoList'),
  '/attendance': () => import('@/pages/attendance/Attendance'),
  '/catalogs': () => import('@/pages/catalogs/Catalogs'),
  '/products': () => import('@/pages/products/Products'),
  '/suppliers': () => import('@/pages/suppliers/Suppliers'),
  '/categories': () => import('@/pages/categories/Categories'),
  '/payment-types': () => import('@/pages/payment-types/PaymentTypes'),
  '/users': () => import('@/pages/users/Users'),
  '/daily-information': () =>
    import('@/pages/daily-information/DailyInformation'),
  '/promotions': () => import('@/pages/promotions/Promotions'),
  '/cash': () => import('@/pages/cash/Cash')
}

const pages = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [path, lazy(load)])
)

// El módulo queda en memoria. Al tocar el enlace la pantalla ya está lista.
export const prefetchRoute = (path) => {
  if (import.meta.env.MODE === 'test') return
  loaders[path]?.().catch(() => {})
}

export const prefetchRoutes = (paths) => {
  if (import.meta.env.MODE === 'test') return
  const pending = [...new Set(paths.filter((path) => loaders[path]))]
  const run = () => {
    const path = pending.shift()
    if (!path) return
    loaders[path]()
      .catch(() => {})
      .finally(() => {
        const schedule =
          window.requestIdleCallback ||
          ((callback) => window.setTimeout(callback, 150))
        schedule(run, { timeout: 1500 })
      })
  }
  const schedule =
    window.requestIdleCallback ||
    ((callback) => window.setTimeout(callback, 400))
  schedule(run, { timeout: 1500 })
}

export const appRoutes = routeRules.map((rule) => ({
  ...rule,
  Component: pages[rule.path]
}))
