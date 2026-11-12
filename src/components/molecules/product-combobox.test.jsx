import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
  it('encuentra palabras separadas y sin acento', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(
      <div role="dialog">
        <label htmlFor="product">Producto</label>
        <ProductCombobox
          id="product"
          products={[
            ...products,
            {
              _id: 'p3',
              productName: 'Coca Cola 600 ml',
              productDescription: 'Refresco'
            },
            { _id: 'p4', productName: 'Atún en agua', productStock: 3 }
          ]}
          value=""
          onValueChange={vi.fn()}
        />
      </div>
    )

    const input = screen.getByRole('combobox', { name: 'Producto' })
    await user.click(input)
    await user.type(input, 'coca 600')
    expect(
      screen.getByRole('option', { name: /Coca Cola 600 ml/ })
    ).toBeVisible()
    expect(screen.queryByRole('option', { name: /Café soluble/ })).toBeNull()

    await user.clear(input)
    await user.type(input, 'atun')
    expect(screen.getByRole('option', { name: /Atún en agua/ })).toBeVisible()
    expect(
      screen.queryByRole('option', { name: /Coca Cola 600 ml/ })
    ).toBeNull()
  })

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
    const option = await screen.findByRole('option', { name: /Café soluble/ })
    expect(option).toHaveTextContent('Stock: 12')
    await user.click(option)

    expect(onValueChange).toHaveBeenCalledWith('p1')
  })

  it('con flecha y Enter elige el producto y no registra el formulario', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const onValueChange = vi.fn()
    const onSubmit = vi.fn((event) => event.preventDefault())

    render(
      <form onSubmit={onSubmit}>
        <div role="dialog">
          <label htmlFor="product">Producto</label>
          <ProductCombobox
            id="product"
            products={products}
            value=""
            onValueChange={onValueChange}
            showStock
          />
          <button type="submit">Registrar</button>
        </div>
      </form>
    )

    await user.click(screen.getByRole('combobox', { name: 'Producto' }))
    await user.keyboard('{ArrowDown}{Enter}')

    expect(onValueChange).toHaveBeenCalledWith('p2')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('no abre la lista cuando el foco vuelve al agregar al carrito', () => {
    setup()
    const input = screen.getByRole('combobox', { name: 'Producto' })
    input.dataset.keepClosed = 'true'
    fireEvent.focus(input)

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(input.dataset.keepClosed).toBeUndefined()
  })
})
