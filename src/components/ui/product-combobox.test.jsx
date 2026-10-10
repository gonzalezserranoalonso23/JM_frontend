import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCombobox from './product-combobox'

const products = [
  {
    _id: 'p1',
    productName: 'Café soluble',
    productDescription: 'Frasco de 100 g',
    productStock: 12
  },
  { _id: 'p2', productName: 'Coca Cola', productStock: 8 }
]

const setup = (onValueChange = vi.fn()) => {
  render(
    <div role="dialog">
      <label htmlFor="product">Producto</label>
      <ProductCombobox
        id="product"
        products={products}
        value=""
        onValueChange={onValueChange}
        showStock
      />
    </div>
  )
  return onValueChange
}

describe('ProductCombobox', () => {
  it('filtra productos sin distinguir acentos', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    setup()

    const input = screen.getByRole('combobox', { name: 'Producto' })
    await user.click(input)
    await user.type(input, 'CAFE')

    expect(screen.getByRole('option', { name: /Café soluble/ })).toBeVisible()
    expect(screen.queryByRole('option', { name: /Coca Cola/ })).toBeNull()
  })

  it('selecciona el producto elegido', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const onValueChange = setup()

    await user.click(screen.getByRole('combobox', { name: 'Producto' }))
    await user.click(
      await screen.findByRole('option', { name: /Café soluble \(Stock: 12\)/ })
    )

    expect(onValueChange).toHaveBeenCalledWith('p1')
  })
})
