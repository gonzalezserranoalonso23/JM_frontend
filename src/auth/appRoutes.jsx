import { lazy } from 'react'
import { routeRules } from '@/auth/access'

const pages = {
  '/home': lazy(() => import('@/pages/home/Home')),
  '/entries': lazy(() => import('@/pages/entries/Entries')),
  '/entries/:id': lazy(() => import('@/pages/entries/EntryDetails')),
  '/issues': lazy(() => import('@/pages/issues/Issues')),
  '/issues/:id': lazy(() => import('@/pages/issues/IssueDetails')),
  '/orders': lazy(() => import('@/pages/orders/Orders')),
  '/reports': lazy(() => import('@/pages/reports/Reports')),
  '/todolist': lazy(() => import('@/pages/todolist/ToDoList')),
  '/attendance': lazy(() => import('@/pages/attendance/Attendance')),
  '/catalogs': lazy(() => import('@/pages/catalogs/Catalogs')),
  '/products': lazy(() => import('@/pages/products/Products')),
  '/suppliers': lazy(() => import('@/pages/suppliers/Suppliers')),
  '/categories': lazy(() => import('@/pages/categories/Categories')),
  '/payment-types': lazy(() => import('@/pages/payment-types/PaymentTypes')),
  '/users': lazy(() => import('@/pages/users/Users')),
  '/daily-information': lazy(
    () => import('@/pages/daily-information/DailyInformation')
  ),
  '/promotions': lazy(() => import('@/pages/promotions/Promotions')),
  '/cash': lazy(() => import('@/pages/cash/Cash'))
}

export const appRoutes = routeRules.map((rule) => ({
  ...rule,
  Component: pages[rule.path]
}))
