import { describe, expect, it } from 'vitest'
import { applyProductUpdate } from '@/features/liveCache'

describe('caché de productos', () => {
  it('reemplaza el producto editado y conserva sus relaciones', () => {
    const current = {
      pages: [{ data: [{ _id: 'p1', productName: 'Arroz', supplier: { _id: 's1' }, category: { _id: 'c1' } }] }]
    }
    const next = applyProductUpdate(current, {
      _id: 'p1',
      productName: 'Arroz premium',
      supplier: 's1',
      category: 'c1'
    })
    expect(next.pages[0].data[0]).toMatchObject({
      productName: 'Arroz premium',
      supplier: { _id: 's1' },
      category: { _id: 'c1' }
    })
  })
})
