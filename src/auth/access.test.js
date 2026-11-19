import { describe, expect, it } from 'vitest'
import { canVisit, compareRoles, routeRules } from './access'

describe('acceso por rol', () => {
  it('un rol no reconocido no entra a las rutas protegidas', () => {
    expect(canVisit('Legacy', '/home')).toBe(false)
    expect(canVisit('Legacy', '/products')).toBe(false)
    expect(canVisit('Legacy', '/suppliers')).toBe(false)
  })

  it('staff entra a entradas, salidas, pendientes, productos y proveedores', () => {
    expect(canVisit('Staff', '/issues')).toBe(true)
    expect(canVisit('Staff', '/entries/1')).toBe(true)
    expect(canVisit('Staff', '/todolist')).toBe(true)
    expect(canVisit('Staff', '/products')).toBe(true)
    expect(canVisit('Staff', '/suppliers')).toBe(true)
    expect(canVisit('Staff', '/cash')).toBe(false)
    expect(canVisit('Staff', '/reports')).toBe(false)
    expect(canVisit('Staff', '/low-stock')).toBe(false)
    expect(canVisit('Staff', '/daily-information')).toBe(false)
    expect(canVisit('Staff', '/catalogs')).toBe(false)
    expect(canVisit('Staff', '/users')).toBe(false)
  })

  it('no registra las rutas retiradas de promociones ni órdenes', () => {
    expect(routeRules.some(({ path }) => path === '/promotions')).toBe(false)
    expect(routeRules.some(({ path }) => path === '/orders')).toBe(false)
  })

  it('sudo entra a las mismas rutas que un administrador y también a usuarios', () => {
    expect(canVisit('Sudo', '/reports')).toBe(true)
    expect(canVisit('Sudo', '/users')).toBe(true)
    expect(canVisit('Sudo', '/roles')).toBe(true)
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
    expect(canVisit('Staff', '/attendance')).toBe(true)
    expect(canVisit('Staff', '/payment-types')).toBe(false)
    expect(canVisit('Legacy', '/ruta-desconocida')).toBe(false)
    expect(canVisit('', '/home')).toBe(false)
    expect(canVisit('', '/users')).toBe(false)
  })

  it('el orden va de Staff a Sudo', () => {
    const names = ['Sudo', 'Manager', 'Staff', 'Supervisor', 'Cajero']
    expect([...names].sort(compareRoles)).toEqual([
      'Staff',
      'Supervisor',
      'Manager',
      'Sudo',
      'Cajero'
    ])
  })
})
