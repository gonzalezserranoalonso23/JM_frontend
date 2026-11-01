import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

const openProfile = async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(
    <TooltipProvider>
      <AccountProfile />
    </TooltipProvider>
  )
  await user.click(screen.getByRole('button', { name: 'Mi información' }))
}

describe('Mi información', () => {
  afterEach(() => {
    cleanup()
    profile.data = null
    profile.isLoading = false
    profile.isError = false
  })

  it('muestra la información y el horario de un usuario', async () => {
    profile.data = {
      username: 'cajero',
      fullName: 'Ana Ruiz',
      email: 'ana@jm.test',
      isAdmin: false
    }
    await openProfile()

    expect(screen.getByText('cajero')).toBeTruthy()
    expect(screen.getByText('Ana Ruiz')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Horario' })).toBeTruthy()
    expect(screen.getAllByText('No trabaja').length).toBe(7)
  })

  it('muestra el horario de un administrador que lo tiene', async () => {
    profile.data = {
      username: 'admin',
      email: 'admin@jm.test',
      isAdmin: true,
      haveSchedule: true,
      schedule: {
        monday: { enabled: true, start: '09:00', end: '18:00' }
      }
    }
    await openProfile()

    expect(screen.getByText('Administrador')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Horario' })).toBeTruthy()
    expect(screen.getByText('09:00 – 18:00')).toBeTruthy()
  })

  it('oculta el horario de un administrador que no lo tiene', async () => {
    profile.data = {
      username: 'admin',
      email: 'admin@jm.test',
      isAdmin: true,
      haveSchedule: false
    }
    await openProfile()

    expect(screen.getByText('Administrador')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Horario' })).toBeNull()
  })
})
