import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import AccountProfile from './AccountProfile'

const profile = vi.hoisted(() => ({
  data: null,
  isLoading: false,
  isError: false
}))

vi.mock('@/features/users.features', () => ({
  useGetCurrentUser: () => profile
}))

const locationPrompt = vi.hoisted(() => ({
  show: true,
  request: vi.fn()
}))

vi.mock('@/hooks/useLocationPrompt', () => ({
  default: () => locationPrompt
}))

vi.mock('@/features/suppliers.features', () => ({
  useGetSuppliers: () => ({ data: [] })
}))

vi.mock('@/features/attendance.features', () => ({
  useMyAttendance: () => ({
    data: { pages: [{ open: null, workDay: true, records: [] }] },
    isError: false
  }),
  useCheckIn: () => ({ mutate: vi.fn(), isPending: false }),
  useCheckOut: () => ({ mutate: vi.fn(), isPending: false }),
  useAttendanceDay: () => ({ data: null, isLoading: false, isError: false })
}))

const openProfile = async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(
    <MemoryRouter initialEntries={['/home']}>
      <TooltipProvider>
        <AccountProfile />
      </TooltipProvider>
    </MemoryRouter>
  )
  await user.click(screen.getByRole('button', { name: 'Mi información' }))
  return user
}

describe('Mi información', () => {
  afterEach(() => {
    cleanup()
    profile.data = null
    profile.isLoading = false
    profile.isError = false
    localStorage.removeItem('jm-theme')
    document.documentElement.classList.add('dark')
    locationPrompt.show = true
    locationPrompt.request.mockClear()
  })

  it('muestra la información y el horario de un usuario', async () => {
    profile.data = {
      username: 'cajero',
      fullName: 'Ana Ruiz',
      email: 'ana@jm.test',
      role: { name: 'User' }
    }
    await openProfile()

    expect(screen.getByText('cajero')).toBeTruthy()
    expect(screen.getByText('Ana Ruiz')).toBeTruthy()
    expect(screen.getByText('User')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Horario' })).toBeTruthy()
    expect(screen.getAllByText('No trabaja').length).toBe(7)
    expect(screen.queryByRole('button', { name: 'Checador' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Registrar entrada' })
    ).toBeNull()
  })

  it('muestra el horario de un administrador que lo tiene', async () => {
    profile.data = {
      username: 'admin',
      email: 'admin@jm.test',
      role: { name: 'Manager' },
      haveSchedule: true,
      schedule: {
        monday: { enabled: true, start: '09:00', end: '18:00' }
      }
    }
    await openProfile()

    expect(screen.getByText('Manager')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Horario' })).toBeTruthy()
    expect(screen.getByText('09:00 – 18:00')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Checador' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Registrar entrada' })
    ).toBeNull()
  })

  it('el supervisor registra su entrada desde el avatar', async () => {
    profile.data = {
      username: 'turno',
      email: 'turno@jm.test',
      role: { name: 'Supervisor' },
      haveSchedule: true,
      schedule: {
        monday: { enabled: true, start: '07:00', end: '15:00' }
      }
    }
    await openProfile()

    expect(screen.getByText('Supervisor')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Horario' })).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Registrar entrada' })
    ).toBeTruthy()
  })

  it('oculta el horario de un administrador que no lo tiene', async () => {
    profile.data = {
      username: 'admin',
      email: 'admin@jm.test',
      role: { name: 'Manager' },
      haveSchedule: false
    }
    await openProfile()

    expect(screen.getByText('Manager')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Horario' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Checador' })).toBeNull()
  })

  it('cambia al tema claro y lo recuerda', async () => {
    profile.data = {
      username: 'admin',
      email: 'admin@jm.test',
      role: { name: 'Manager' },
      haveSchedule: false
    }
    const user = await openProfile()

    await user.click(screen.getByRole('button', { name: 'Claro' }))

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('jm-theme')).toBe('light')
  })

  it('el usuario activa notificaciones y ubicación desde el avatar', async () => {
    profile.data = {
      username: 'cajero',
      fullName: 'Ana Ruiz',
      email: 'ana@jm.test',
      role: { name: 'User' }
    }
    locationPrompt.show = true
    const requestNotifications = vi.fn()
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(
      <MemoryRouter initialEntries={['/home']}>
        <TooltipProvider>
          <AccountProfile
            notifications={{ show: true, request: requestNotifications }}
          />
        </TooltipProvider>
      </MemoryRouter>
    )
    await user.click(screen.getByRole('button', { name: 'Mi información' }))
    await user.click(
      screen.getByRole('button', { name: 'Activar notificaciones' })
    )
    await user.click(screen.getByRole('button', { name: 'Permitir ubicación' }))

    expect(requestNotifications).toHaveBeenCalledOnce()
    expect(locationPrompt.request).toHaveBeenCalledOnce()
  })
})
