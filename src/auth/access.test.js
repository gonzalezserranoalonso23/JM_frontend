import { describe, expect, it } from 'vitest'
import { canVisit } from './access'

describe('acceso por rol', () => {
  it('el usuario entra a inicio, pendientes, productos, proveedores y caja', () => {
    expect(canVisit('User', '/home')).toBe(true)
    expect(canVisit('User', '/todolist')).toBe(true)
    expect(canVisit('User', '/products')).toBe(true)
    expect(canVisit('User', '/suppliers')).toBe(true)
    expect(canVisit('User', '/cash')).toBe(true)
    expect(canVisit('User', '/issues')).toBe(false)
    expect(canVisit('User', '/entries/1')).toBe(false)
    expect(canVisit('User', '/orders')).toBe(false)
  })

  it('staff entra a entradas, salidas y caja, y no a reportes ni catálogos', () => {
    expect(canVisit('Staff', '/issues')).toBe(true)
    expect(canVisit('Staff', '/entries/1')).toBe(true)
    expect(canVisit('Staff', '/cash')).toBe(true)
    expect(canVisit('Staff', '/products')).toBe(true)
    expect(canVisit('Staff', '/reports')).toBe(false)
    expect(canVisit('Staff', '/orders')).toBe(false)
    expect(canVisit('Staff', '/promotions')).toBe(false)
    expect(canVisit('Staff', '/daily-information')).toBe(false)
    expect(canVisit('Staff', '/catalogs')).toBe(false)
    expect(canVisit('Staff', '/users')).toBe(false)
  })

  it('manager y supervisor entran a cualquier ruta', () => {
    expect(canVisit('Manager', '/reports')).toBe(true)
    expect(canVisit('Manager', '/users')).toBe(true)
    expect(canVisit('Supervisor', '/attendance')).toBe(true)
    expect(canVisit('Supervisor', '/catalogs')).toBe(true)
  })
})
