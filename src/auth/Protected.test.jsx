import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Protected from './Protected'
import { appRoutes } from './appRoutes'
import { routeRules } from './access'

const auth = vi.hoisted(() => ({
  auth: 'token',
  role: 'User',
  me: { role: { name: 'User' } },
  isLoading: false
}))

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector) =>
    selector({
      auth: auth.auth,
      role: auth.role
    })
}))

vi.mock('@/features/users.features', () => ({
  useGetCurrentUser: () => ({
    data: auth.me,
    isLoading: auth.isLoading
  })
}))

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<h1>Login</h1>} />
        <Route element={<Protected />}>
          <Route path="/home" element={<h1>Inicio</h1>} />
          <Route path="/users" element={<h1>Usuarios</h1>} />
          <Route path="/products" element={<h1>Productos</h1>} />
          <Route path="/entries/:id" element={<h1>Entrada</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )

describe('rutas protegidas por usuario', () => {
  afterEach(() => {
    cleanup()
    auth.auth = 'token'
    auth.role = 'User'
    auth.me = { role: { name: 'User' } }
    auth.isLoading = false
  })

  it('cada ruta de la app declara quién puede entrar', () => {
    expect(appRoutes.map((route) => route.path)).toEqual(
      routeRules.map((rule) => rule.path)
    )
    expect(appRoutes.every((route) => route.Component)).toBe(true)
  })

  it('sin sesión manda al login', () => {
    auth.auth = ''
    auth.role = ''
    auth.me = undefined
    renderAt('/products')
    expect(screen.getByRole('heading', { name: 'Login' })).toBeTruthy()
  })

  it('User no abre usuarios y sí abre productos', () => {
    renderAt('/users')
    expect(screen.getByRole('heading', { name: 'Inicio' })).toBeTruthy()
    cleanup()
    renderAt('/products')
    expect(screen.getByRole('heading', { name: 'Productos' })).toBeTruthy()
  })

  it('el rol del servidor gana sobre el guardado en la sesión', () => {
    auth.role = 'Manager'
    auth.me = { role: { name: 'User' } }
    renderAt('/users')
    expect(screen.getByRole('heading', { name: 'Inicio' })).toBeTruthy()
  })

  it('Staff no abre el detalle de una entrada ajena al rol User, y sí la abre Staff', () => {
    renderAt('/entries/1')
    expect(screen.getByRole('heading', { name: 'Inicio' })).toBeTruthy()
    cleanup()
    auth.role = 'Staff'
    auth.me = { role: { name: 'Staff' } }
    renderAt('/entries/1')
    expect(screen.getByRole('heading', { name: 'Entrada' })).toBeTruthy()
  })
})
