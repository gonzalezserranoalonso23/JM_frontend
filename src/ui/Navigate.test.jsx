import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navigate from './Navigate'

const auth = vi.hoisted(() => ({ isAdmin: true, haveSchedule: true }))

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector) =>
    selector({
      logOut: vi.fn(),
      isAdmin: auth.isAdmin
    })
}))

vi.mock('@/features/tasks.features', () => ({
  useGetPendingTasks: () => ({ data: [] })
}))

vi.mock('@/features/users.features', () => ({
  useGetCurrentUser: () => ({
    data: {
      isAdmin: auth.isAdmin,
      haveSchedule: auth.haveSchedule
    }
  })
}))

vi.mock('@/hooks/useTaskNotifications', () => ({
  default: () => ({ showNotifications: false, requestPermission: vi.fn() })
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
    auth.isAdmin = true
    auth.haveSchedule = true
  })

  it('un administrador con horario ve Asistencia dentro de Reportes', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderNav()

    expect(screen.queryByRole('link', { name: 'Asistencia' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Reportes' }))

    expect(screen.getByRole('menuitem', { name: 'Ventas' })).toHaveAttribute(
      'href',
      '/reports'
    )
    expect(screen.getByRole('menuitem', { name: 'Asistencia' })).toHaveAttribute(
      'href',
      '/attendance'
    )
  })

  it('un administrador sin horario no ve Asistencia dentro de Reportes', async () => {
    auth.haveSchedule = false
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderNav()

    await user.click(screen.getByRole('button', { name: 'Reportes' }))

    expect(screen.getByRole('menuitem', { name: 'Ventas' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Asistencia' })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: 'Asistencia' })).toBeNull()
  })

  it('el personal ve Inicio, Productos y Proveedores', () => {
    auth.isAdmin = false
    auth.haveSchedule = true
    renderNav()

    expect(screen.queryByRole('link', { name: 'Pendientes' })).toBeNull()
    expect(screen.getAllByRole('link', { name: 'Inicio' })[0]).toHaveAttribute(
      'href',
      '/home'
    )
    expect(
      screen.getAllByRole('link', { name: 'Productos' })[0]
    ).toHaveAttribute('href', '/products')
    expect(
      screen.getAllByRole('link', { name: 'Proveedores' })[0]
    ).toHaveAttribute('href', '/suppliers')
    expect(screen.queryByRole('link', { name: 'Asistencia' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Salidas' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Más' })).toBeNull()
    expect(
      screen.getAllByRole('button', { name: 'Cerrar sesión' }).length
    ).toBeGreaterThan(0)
  })
})