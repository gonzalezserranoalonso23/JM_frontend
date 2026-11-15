import { describe, expect, it } from 'vitest'
import { canVisit, compareRoles } from './access'

describe('acceso por rol', () => {
  it('el usuario entra a inicio, productos y proveedores', () => {
    expect(canVisit('User', '/home')).toBe(true)
    expect(canVisit('User', '/products')).toBe(true)
    expect(canVisit('User', '/suppliers')).toBe(true)
    expect(canVisit('User', '/todolist')).toBe(false)
    expect(canVisit('User', '/cash')).toBe(false)
    expect(canVisit('User', '/issues')).toBe(false)
    expect(canVisit('User', '/entries/1')).toBe(false)
    expect(canVisit('User', '/orders')).toBe(false)
  })

  it('staff entra a entradas, salidas, productos y proveedores', () => {
    expect(canVisit('Staff', '/issues')).toBe(true)
    expect(canVisit('Staff', '/entries/1')).toBe(true)
    expect(canVisit('Staff', '/products')).toBe(true)
    expect(canVisit('Staff', '/suppliers')).toBe(true)
    expect(canVisit('Staff', '/cash')).toBe(false)
    expect(canVisit('Staff', '/todolist')).toBe(false)
    expect(canVisit('Staff', '/reports')).toBe(false)
    expect(canVisit('Staff', '/low-stock')).toBe(false)
    expect(canVisit('Staff', '/orders')).toBe(false)
    expect(canVisit('Staff', '/promotions')).toBe(false)
    expect(canVisit('Staff', '/daily-information')).toBe(false)
    expect(canVisit('Staff', '/catalogs')).toBe(false)
    expect(canVisit('Staff', '/users')).toBe(false)
  })

  it('sudo entra a las mismas rutas que un administrador y también a usuarios', () => {
    expect(canVisit('Sudo', '/reports')).toBe(true)
    expect(canVisit('Sudo', '/users')).toBe(true)
    expect(canVisit('Sudo', '/roles')).toBe(true)
    expect(canVisit('Sudo', '/orders')).toBe(true)
    expect(canVisit('Sudo', '/ruta-desconocida')).toBe(true)
  })

  it('manager y supervisor entran al negocio y no al catálogo de roles', () => {
    expect(canVisit('Manager', '/reports')).toBe(true)
    expect(canVisit('Manager', '/low-stock')).toBe(true)
    expect(canVisit('Manager', '/users')).toBe(true)
    expect(canVisit('Manager', '/roles')).toBe(false)
    expect(canVisit('Supervisor', '/users')).toBe(true)
    expect(canVisit('Supervisor', '/roles')).toBe(false)
    expect(canVisit('Supervisor', '/attendance')).toBe(true)
    expect(canVisit('Supervisor', '/catalogs')).toBe(true)
    expect(canVisit('Manager', '/ruta-desconocida')).toBe(true)
    expect(canVisit('User', '/categories')).toBe(false)
    expect(canVisit('User', '/attendance')).toBe(false)
    expect(canVisit('Staff', '/payment-types')).toBe(false)
    expect(canVisit('User', '/ruta-desconocida')).toBe(false)
    expect(canVisit('', '/home')).toBe(true)
    expect(canVisit('', '/users')).toBe(false)
  })

  it('el orden va de User a Sudo', () => {
    const names = ['Sudo', 'User', 'Manager', 'Staff', 'Supervisor', 'Cajero']
    expect([...names].sort(compareRoles)).toEqual([
      'User',
      'Staff',
      'Supervisor',
      'Manager',
      'Sudo',
      'Cajero'
    ])
  })
})
