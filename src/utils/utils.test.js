import { describe, it, expect } from 'vitest'
import { isoDay, formatDate, todayLocal } from './dateDisplay'
import { buildMatcher, matchesCells } from './filterMatcher'
import {
  clampNumberInputValue,
  formatQty,
  informativeStock,
  limitNumberInputDecimals,
  roundTo
} from './commonFunctions'
import {
  ALL_USERS,
  attendanceDay,
  attendancePages,
  attendanceRows,
  paidToSuppliers
} from './attendance'
import { countedTotal, DENOMINATIONS, quantityOf } from './cash'
import { callHref, whatsappHref } from './phone'
import { recordCardView } from './recordDisplay'
import { movementPrices } from './typeInventory'
import { searchTokens, similarProducts } from './productSearch'

describe('dateDisplay', () => {
  it('isoDay conserva el día guardado sin cambiar zona horaria', () => {
    expect(isoDay('2026-03-05T23:59:59.000Z')).toBe('2026-03-05')
    expect(isoDay('15/10/2026')).toBe('2026-10-15')
    expect(isoDay('16/10/26')).toBe('2026-10-16')
    expect(isoDay('')).toBe('')
    expect(isoDay('basura')).toBe('')
    expect(isoDay('31/02/2026')).toBe('')
  })

  it('formatDate regresa vacío con fechas inválidas', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate('2026-01-02', 'es-MX')).toContain('2026')
  })

  it('todayLocal tiene formato YYYY-MM-DD', () => {
    expect(todayLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(todayLocal(1) > todayLocal()).toBe(true)
  })
})

describe('filterMatcher', () => {
  it('sin patrón no filtra', () => {
    expect(buildMatcher('  ')).toBeNull()
    expect(matchesCells(['a'], null)).toBe(true)
  })

  it('coincide por includes sin importar mayúsculas', () => {
    const m = buildMatcher('cola')
    expect(m('Coca COLA 600ml')).toBe(true)
    expect(m('Agua')).toBe(false)
  })

  it('un patrón inválido no truena', () => {
    const m = buildMatcher('(')
    expect(m('a (b')).toBe(true)
  })
})

describe('clampNumberInputValue', () => {
  it('permite hasta 3 decimales y recorta el resto', () => {
    expect(clampNumberInputValue('1.234')).toBe('1.234')
    expect(clampNumberInputValue('1.2345')).toBe('1.234')
    expect(clampNumberInputValue('-0.0019')).toBe('-0.001')
    expect(clampNumberInputValue('12')).toBe('12')
    expect(clampNumberInputValue('1.2')).toBe('1.2')
  })

  it('solo aplica a inputs number', () => {
    const numberInput = { tagName: 'INPUT', type: 'number', value: '1.23456' }
    const textInput = { tagName: 'INPUT', type: 'text', value: '1.23456' }
    limitNumberInputDecimals(numberInput)
    limitNumberInputDecimals(textInput)
    expect(numberInput.value).toBe('1.234')
    expect(textInput.value).toBe('1.23456')
  })
})

describe('informativeStock', () => {
  it('deja el stock original y baja solo el disponible del carrito', () => {
    expect(informativeStock(10, 0)).toEqual({
      original: 10,
      inCart: 0,
      available: 10
    })
    expect(informativeStock(10, 3)).toEqual({
      original: 10,
      inCart: 3,
      available: 7
    })
    expect(informativeStock(10, 3.5 + 1.5)).toEqual({
      original: 10,
      inCart: 5,
      available: 5
    })
  })
})

describe('roundTo', () => {
  it('recorta cantidades a 3 decimales sin arrastrar basura flotante', () => {
    expect(formatQty(0.30000000000000004)).toBe(0.3)
    expect(formatQty(1.2346)).toBe(1.235)
    expect(roundTo(12.3456, 2)).toBe(12.35)
    expect(roundTo('1.005', 2)).toBe(1.01)
  })
})

describe('movementPrices', () => {
  it('en una salida usa el precio cobrado y el costo del producto', () => {
    expect(
      movementPrices({
        quantity: 2,
        productPrice: '10.5',
        typeInventory: { stockDirection: -1 },
        productName: { purchasePrice: 6, productPrice: 12 }
      })
    ).toEqual({ purchasePrice: 6, productPrice: 10.5, profit: 9 })
  })

  it('en una salida prefiere el costo guardado en el movimiento', () => {
    expect(
      movementPrices({
        quantity: 2,
        productPrice: '10',
        purchasePrice: 4,
        typeInventory: { stockDirection: -1 },
        productName: { purchasePrice: 6, productPrice: 12 }
      })
    ).toEqual({ purchasePrice: 4, productPrice: 10, profit: 12 })
  })

  it('en una entrada no calcula utilidad', () => {
    expect(
      movementPrices({
        quantity: 3,
        productPrice: '4',
        typeInventory: { stockDirection: 1 },
        productName: { purchasePrice: 9, productPrice: 7 }
      })
    ).toEqual({ purchasePrice: null, productPrice: null, profit: null })
  })

  it('no calcula utilidad si falta un precio', () => {
    expect(
      movementPrices({
        quantity: 1,
        productPrice: '10',
        typeInventory: { stockDirection: -1 },
        productName: { productName: 'Agua' }
      }).profit
    ).toBeNull()
  })
})

describe('attendanceRows', () => {
  it('no arma total cuando el turno no pagó proveedores', () => {
    const rows = attendanceRows(
      [{ _id: 'u1', username: 'ana', fullName: 'Ana' }],
      [
        {
          _id: 's1',
          user: { _id: 'u1' },
          checkInAt: '2026-11-11T15:00:00.000Z',
          cashReceived: 100,
          supplierPayments: []
        }
      ],
      ALL_USERS
    )

    expect(rows).toHaveLength(1)
    expect(rows[0].payments).toEqual([])
    expect(rows[0].total).toBe('—')
    expect(rows[0].received).toBe('$100.00')
    expect(paidToSuppliers([])).toBe(0)
  })

  it('reads pages and the day from the response fields', () => {
    expect(
      attendancePages({
        pages: [
          { open: { _id: '1' }, workDay: true, records: [{ _id: 'a' }] },
          { records: [{ _id: 'b' }] }
        ]
      })
    ).toMatchObject({
      loaded: true,
      open: { _id: '1' },
      workDay: true,
      records: [{ _id: 'a' }, { _id: 'b' }]
    })
    expect(attendanceDay()).toEqual({ staff: [], records: [] })
  })
})

describe('recordCardView', () => {
  it('deja la utilidad fuera de la tarjeta cuando no es una salida', () => {
    const view = recordCardView(
      {
        productName: { productName: 'Agua' },
        date: '2026-11-11',
        typeInventory: { typeInventory: 'Entrada', stockDirection: 1 },
        quantity: 2,
        productPrice: 4,
        totalAmount: 8
      },
      { showProfit: true, showPayment: true }
    )

    expect(view.name).toBe('Agua')
    expect(view.profit).toBeNull()
    expect(view.payment).toBe('-')
    expect(view.total).toBe('$8.00')
  })
})

describe('similarProducts', () => {
  const catalog = [
    {
      _id: '1',
      productName: 'Coca Cola 600 ml',
      productDescription: 'Refresco'
    },
    { _id: '2', productName: 'Sabritas', productDescription: 'Bolsa coca' },
    { _id: '3', productName: 'Atún en agua', productDescription: 'Lata' }
  ]

  it('junta palabras sueltas y ignora acentos', () => {
    expect(
      similarProducts(catalog, 'coca 600').map((item) => item._id)
    ).toEqual(['1'])
    expect(similarProducts(catalog, 'atun').map((item) => item._id)).toEqual([
      '3'
    ])
    expect(similarProducts(catalog, 'zzz')).toEqual([])
  })

  it('no pide palabras de relleno ni letras sueltas', () => {
    expect(searchTokens('coca de 600')).toEqual(['coca', '600'])
    expect(searchTokens('de')).toEqual([])
    expect(searchTokens('c')).toEqual([])
  })

  it('coca de 600 trae las presentaciones de 600 y deja fuera las otras', () => {
    const sodas = [
      { _id: '600', productName: 'Coca Cola 600 ml' },
      { _id: 'light', productName: 'Coca Cola Light 600 ml' },
      { _id: 'sa', productName: 'Coca Cola S/A 600 ml' },
      { _id: '500', productName: 'Coca Cola 500 ml' },
      { _id: '250', productName: 'Coca Cola 250 ml' }
    ]
    expect(
      similarProducts(sodas, 'coca de 600').map((item) => item._id)
    ).toEqual(['600', 'light', 'sa'])
  })

  it('pone primero el nombre que empieza con lo escrito', () => {
    const ranked = similarProducts(
      [
        { _id: 'a', productName: 'Leche deslactosada' },
        { _id: 'b', productName: 'Leche' }
      ],
      'leche'
    )
    expect(ranked.map((item) => item._id)).toEqual(['b', 'a'])
  })
})

describe('cash', () => {
  it('cuenta solo piezas enteras', () => {
    expect(quantityOf({ 10: '2.9' }, 10)).toBe(2)
    expect(countedTotal(DENOMINATIONS, { 10: 3, 0.5: 4 })).toBe(32)
  })
})

describe('phone', () => {
  it('arma la llamada y el enlace de WhatsApp', () => {
    expect(callHref('618 688 2483')).toBe('tel:6186882483')
    expect(callHref('')).toBe('')
    expect(whatsappHref('6186882483')).toBe('https://wa.me/526186882483')
    expect(whatsappHref('+52 1 618 688 2483')).toBe(
      'https://wa.me/526186882483'
    )
    expect(whatsappHref('123')).toBe('')
  })
})
