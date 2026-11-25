import { lazy } from 'react'
import { routeRules } from '@/auth/access'

const loaders = {
  '/home': () => import('@/pages/home/Home'),
  '/products': () => import('@/pages/products/Products'),
  '/suppliers': () => import('@/pages/suppliers/Suppliers'),
  '/cash': () => import('@/pages/cash/Cash'),
  '/reports': () => import('@/pages/reports/Reports'),
  '/attendance': () => import('@/pages/attendance/Attendance'),
  '/daily-information': () =>
    import('@/pages/daily-information/DailyInformation'),
  '/todolist': () => import('@/pages/todolist/ToDoList'),
  '/users': () => import('@/pages/users/Users')
}

const pages = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [path, lazy(load)])
)

// The module stays in memory. The screen is ready when the link is pressed.
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
