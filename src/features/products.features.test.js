import { describe, expect, it } from 'vitest'
import {
  applyProductUpdate,
  applyStockDeltas,
  prependInventoryRecords,
  removeInventoryRecord
} from '@/features/liveCache'

const cached = {
  pages: [
    {
      data: [
        {
          _id: 'p1',
          productName: 'Arroz',
          productPrice: 10,
          supplier: { _id: 's1', suppliersName: 'Abastos' },
          category: { _id: 'c1', categories: 'Abarrotes' }
        }
      ]
    }
  ]
}

describe('applyProductUpdate', () => {
  it('reemplaza el producto editado y conserva proveedor y categoría', () => {
    const next = applyProductUpdate(cached, {
      _id: 'p1',
      productName: 'Arroz premium',
      productPrice: 12,
      supplier: 's1',
      category: 'c1'
    })

    expect(next.pages[0].data[0]).toMatchObject({
      productName: 'Arroz premium',
      productPrice: 12,
      supplier: { _id: 's1', suppliersName: 'Abastos' },
      category: { _id: 'c1', categories: 'Abarrotes' }
    })
  })

  it('toma el nombre nuevo si cambió el proveedor', () => {
    const next = applyProductUpdate(
      cached,
      { _id: 'p1', supplier: 's2', category: 'c1' },
      { suppliers: [{ _id: 's2', suppliersName: 'Bimbo' }] }
    )

    expect(next.pages[0].data[0].supplier).toEqual({
      _id: 's2',
      suppliersName: 'Bimbo'
    })
  })
})

describe('caché de entradas y salidas', () => {
  const list = {
    pages: [
      {
        total: 1,
        data: [
          {
            _id: 'm1',
            quantity: 2,
            productName: { _id: 'p1', productName: 'Arroz' }
          }
        ]
      }
    ]
  }

  it('pone el movimiento nuevo al inicio y suma el total', () => {
    const next = prependInventoryRecords(list, [
      {
        _id: 'm2',
        quantity: 1,
        productName: { _id: 'p2', productName: 'Frijol' }
      }
    ])
    expect(next.pages[0].data.map((row) => row._id)).toEqual(['m2', 'm1'])
    expect(next.pages[0].total).toBe(2)
  })

  it('suma el stock del catálogo con la dirección del movimiento', () => {
    const next = applyStockDeltas(
      {
        pages: [{ data: [{ _id: 'p1', productStock: 10 }] }]
      },
      { p1: -3 }
    )
    expect(next.pages[0].data[0].productStock).toBe(7)
  })

  it('actualiza el producto dentro de la lista de la salida', () => {
    const catalog = [
      { _id: 'p1', productName: 'Arroz', productStock: 10, productPrice: 8 },
      { _id: 'p2', productName: 'Frijol', productStock: 4, productPrice: 6 }
    ]
    const edited = applyProductUpdate(catalog, {
      _id: 'p1',
      productName: 'Arroz premium',
      productPrice: 9
    })
    const sold = applyStockDeltas(edited, { p1: -2 })
    expect(sold[0]).toMatchObject({
      productName: 'Arroz premium',
      productPrice: 9,
      productStock: 8
    })
    expect(sold[1].productName).toBe('Frijol')
  })

  it('quita el movimiento borrado', () => {
    const next = removeInventoryRecord(list, 'm1')
    expect(next.pages[0].data).toEqual([])
    expect(next.pages[0].total).toBe(0)
  })
})
