import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navigate from './Navigate'

const auth = vi.hoisted(() => ({ isAdmin: true }))

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
  })

  it('abre Reportes y muestra Ventas y Asistencia', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderNav()

    expect(screen.queryByRole('link', { name: 'Ventas' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Asistencia' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Reportes' }))

    expect(screen.getByRole('menuitem', { name: 'Ventas' })).toHaveAttribute(
      'href',
      '/reports'
    )
    expect(
      screen.getByRole('menuitem', { name: 'Asistencia' })
    ).toHaveAttribute('href', '/attendance')
  })

  it('el personal conserva Asistencia como enlace directo', () => {
    auth.isAdmin = false
    renderNav()

    expect(screen.queryByRole('button', { name: 'Reportes' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Asistencia' })).toHaveAttribute(
      'href',
      '/attendance'
    )
  })
})