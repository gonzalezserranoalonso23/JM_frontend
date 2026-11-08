import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navigate from './Navigate'

const auth = vi.hoisted(() => ({
  haveSchedule: true,
  roleName: 'Manager'
}))
const notifications = vi.hoisted(() => ({
  showNotifications: false,
  requestPermission: vi.fn()
}))

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector) =>
    selector({
      logOut: vi.fn(),
      role: auth.roleName
    })
}))

vi.mock('@/features/tasks.features', () => ({
  useGetPendingTasks: () => ({ data: [] })
}))

vi.mock('@/features/users.features', () => ({
  useGetCurrentUser: () => ({
    data: {
      haveSchedule: auth.haveSchedule,
      role: { name: auth.roleName }
    }
  })
}))

vi.mock('@/hooks/useTaskNotifications', () => ({
  default: () => notifications
}))

vi.mock('@/services/users.services', () => ({
  logout: vi.fn()
}))

vi.mock('@/pages/home/components/ProductLookup', () => ({
  default: () => null
}))

vi.mock('@/ui/AccountProfile', () => ({
  default: () => null
}))

const renderNav = () =>
  render(
    <MemoryRouter initialEntries={['/home']}>
      <Navigate />
    </MemoryRouter>
  )

describe('Navigate de administrador', () => {
  afterEach(() => {
    cleanup()
    auth.haveSchedule = true
    auth.roleName = 'Manager'
    notifications.showNotifications = false
  })

  it('Reportes abre Ventas y Asistencias', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderNav()

    expect(screen.queryByRole('link', { name: 'Asistencias' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Reportes' }))

    expect(screen.getByRole('menuitem', { name: 'Ventas' })).toHaveAttribute(
      'href',
      '/reports'
    )
    expect(
      screen.getByRole('menuitem', { name: 'Asistencias' })
    ).toHaveAttribute('href', '/attendance')
  })

  it('Reportes sigue mostrando Asistencias aunque no haya horario', async () => {
    auth.haveSchedule = false
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderNav()

    await user.click(screen.getByRole('button', { name: 'Reportes' }))

    expect(screen.getByRole('menuitem', { name: 'Ventas' })).toBeTruthy()
    expect(
      screen.getByRole('menuitem', { name: 'Asistencias' })
    ).toHaveAttribute('href', '/attendance')
  })

  it('staff ve el menú completo sin reportes y consulta producto y proveedores', () => {
    auth.roleName = 'Staff'
    renderNav()

    expect(screen.queryByRole('button', { name: 'Reportes' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Catálogo' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Órdenes' })).toBeNull()
    expect(
      screen.queryByRole('link', { name: 'Información diaria' })
    ).toBeNull()
    expect(screen.queryByRole('link', { name: 'Promociones' })).toBeNull()
    expect(
      screen.getAllByRole('link', { name: 'Pendientes' })[0]
    ).toHaveAttribute('href', '/todolist')
    expect(
      screen.getAllByRole('link', { name: 'Producto' })[0]
    ).toHaveAttribute('href', '/products')
    expect(
      screen.getAllByRole('link', { name: 'Proveedores' })[0]
    ).toHaveAttribute('href', '/suppliers')
  })

  it('el usuario ve Inicio, Pendientes, Productos, Proveedores, Caja y la lupa', () => {
    auth.roleName = 'User'
    auth.haveSchedule = true
    notifications.showNotifications = true
    renderNav()

    expect(screen.getAllByRole('link', { name: 'Inicio' })[0]).toHaveAttribute(
      'href',
      '/home'
    )
    expect(
      screen.getAllByRole('link', { name: 'Pendientes' })[0]
    ).toHaveAttribute('href', '/todolist')
    expect(
      screen.getAllByRole('link', { name: 'Productos' })[0]
    ).toHaveAttribute('href', '/products')
    expect(
      screen.getAllByRole('link', { name: 'Proveedores' })[0]
    ).toHaveAttribute('href', '/suppliers')
    expect(
      screen.getAllByRole('link', { name: 'Caja' })[0]
    ).toHaveAttribute('href', '/cash')
    expect(screen.queryByRole('link', { name: 'Salidas' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Entradas' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Asistencias' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reportes' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Más' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Activar notificaciones' })
    ).toBeNull()
    expect(
      screen.getAllByRole('button', { name: 'Cerrar sesión' }).length
    ).toBeGreaterThan(0)
  })
})
