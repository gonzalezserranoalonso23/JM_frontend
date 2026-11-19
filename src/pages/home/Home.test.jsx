import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

const { pendingTasks } = vi.hoisted(() => ({
  pendingTasks: {
    tasks: [{ _id: 'task-1', title: 'Revisar bodega' }],
    total: 1
  }
}))

vi.mock('@/features/users.features', () => ({
  useRoleName: () => 'Staff'
}))

vi.mock('@/features/tasks.features', () => ({
  useGetPendingTasks: () => pendingTasks
}))

vi.mock('@/pages/attendance/Attendance', () => ({
  AttendancePunch: () => <div>Checador</div>
}))

describe('Inicio de Staff', () => {
  afterEach(cleanup)
  beforeEach(() => {
    pendingTasks.tasks = [{ _id: 'task-1', title: 'Revisar bodega' }]
    pendingTasks.total = 1
  })

  it('muestra el checador y una tarjeta compacta cuando hay pendientes', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(await screen.findByText('Checador')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Pendientes' })).toBeTruthy()
    expect(screen.getByText('1 por atender')).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Ver pendientes' })
    ).toHaveAttribute('href', '/todolist')
  })

  it('no muestra la tarjeta si no hay pendientes', async () => {
    pendingTasks.tasks = []
    pendingTasks.total = 0

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(await screen.findByText('Checador')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Pendientes' })).toBeNull()
  })
})
