import { afterEach, describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const products = [
  {
    _id: 'p1',
    productName: 'Arroz 1kg',
    category: { _id: 'c1' },
    purchasePrice: 20,
    productStock: 10
  }
]

vi.mock('@/features/products.features', () => ({
  useGetProducts: () => ({
    data: products,
    isLoading: false,
    refetch: () => Promise.resolve({ data: products })
  })
}))

vi.mock('@/features/typeInventory.features', () => ({
  useGetTypeInventories: () => ({
    entryType: { value: 'entry-1', label: 'Entrada', stockDirection: 1 }
  })
}))

vi.mock('@/components/ui/product-combobox', () => ({
  default: ({ id, products, value, onValueChange, placeholder }) => (
    <select
      id={id}
      aria-label="Producto"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {(products ?? []).map((product) => (
        <option key={product._id} value={product._id}>
          {product.productName}
        </option>
      ))}
    </select>
  )
}))

import ModalEntries from './ModalEntries'

afterEach(() => {
  vi.restoreAllMocks()
})

const setup = (props = {}) => {
  const handleClose = vi.fn()
  const action = { mutate: vi.fn() }
  const createBulkAction = { mutateAsync: vi.fn() }
  render(
    <ModalEntries
      modalShow
      handleClose={handleClose}
      action={action}
      createBulkAction={createBulkAction}
      {...props}
    />
  )
  return { handleClose, action, createBulkAction }
}

describe('ModalEntries', () => {
  it('muestra el error de validación en el modal, no con window.alert', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    setup()

    await user.click(
      screen.getByRole('button', { name: /agregar al carrito/i })
    )

    expect(alert).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Selecciona un producto y una cantidad'
    )
  })

  it('limpia el aviso al agregar un producto al carrito', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    setup()

    await user.click(
      screen.getByRole('button', { name: /agregar al carrito/i })
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Producto'), 'p1')
    await user.type(screen.getByLabelText('Cantidad'), '2')
    await user.click(
      screen.getByRole('button', { name: /agregar al carrito/i })
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getAllByText(/Arroz 1kg/).length).toBeGreaterThan(0)
  })

  it('en edición muestra el aviso si faltan campos', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    setup({ isEditing: true, record: { _id: 'r1' } })

    fireEvent.submit(
      screen.getByRole('button', { name: /guardar cambios/i }).closest('form')
    )

    expect(alert).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Completa los campos requeridos'
    )
  })
})
