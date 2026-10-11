import { afterEach, describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const products = [
  {
    _id: 'p1',
    productName: 'Coca Cola 600ml',
    supplier: { _id: 's1' },
    purchasePrice: 15
  },
  {
    _id: 'p2',
    productName: 'Café Soluble',
    supplier: { _id: 's1' },
    purchasePrice: 40
  },
  {
    _id: 'p3',
    productName: 'Coca Apagada',
    supplier: { _id: 's1' },
    isActive: false
  },
  { _id: 'p4', productName: 'Coca Otro Proveedor', supplier: { _id: 's2' } }
]

vi.mock('@/features/products.features', () => ({
  useGetProducts: () => ({ data: products, isLoading: false })
}))
vi.mock('@/features/suppliers.features', () => ({
  useGetSuppliers: () => ({
    data: [{ _id: 's1', supplierName: 'Proveedor 1' }],
    isLoading: false
  })
}))

import ModalOrderRequest from './ModalOrderRequest'

afterEach(() => {
  vi.restoreAllMocks()
})

const setup = (order) => {
  const action = { mutate: vi.fn() }
  const handleClose = vi.fn()
  render(
    <ModalOrderRequest
      modalShow
      handleClose={handleClose}
      action={action}
      order={order}
    />
  )
  return { action, handleClose }
}

describe('ModalOrderRequest', () => {
  it('deshabilita el producto sin proveedor', () => {
    setup()
    expect(screen.getByLabelText('Producto')).toBeDisabled()
  })

  it('filtra con includes, solo activos del proveedor', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    setup({ supplier: 's1', items: [], date: '2026-01-01' })
    const input = screen.getByLabelText('Producto')
    await user.click(input)
    expect(await screen.findByText('Coca Cola 600ml')).toBeInTheDocument()
    expect(screen.queryByText('Coca Apagada')).not.toBeInTheDocument()
    expect(screen.queryByText('Coca Otro Proveedor')).not.toBeInTheDocument()

    await user.type(input, 'CAFE')
    expect(screen.getByText('Café Soluble')).toBeInTheDocument()
    expect(screen.queryByText('Coca Cola 600ml')).not.toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'zzz')
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })

  it('al elegir un producto llena el precio y permite agregarlo', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    setup({ supplier: 's1', items: [], date: '2026-01-01' })
    await user.click(screen.getByLabelText('Producto'))
    await user.pointer({
      keys: '[MouseLeft>]',
      target: await screen.findByText('Coca Cola 600ml')
    })
    expect(screen.getByLabelText('Precio compra')).toHaveValue(15)
    await user.type(screen.getByLabelText('Cantidad'), '2')
    await user.click(screen.getByRole('button', { name: /agregar producto/i }))
    expect(screen.getAllByText(/Coca Cola 600ml/).length).toBeGreaterThan(0)
  })

  it('reubica la lista de productos al cambiar el espacio del modal en móvil', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    setup({ supplier: 's1', items: [], date: '2026-01-01' })

    const input = screen.getByLabelText('Producto')
    const dialog = input.closest('[role="dialog"]')
    const header = dialog.querySelector('header')
    const footer = dialog.querySelector('footer')
    const bounds = {
      dialog: {
        top: 0,
        bottom: 600,
        left: 0,
        right: 360,
        width: 360,
        height: 600
      },
      header: { top: 0, bottom: 60 },
      footer: { top: 450, bottom: 600 },
      input: { top: 200, bottom: 240, left: 20, right: 340, width: 320 }
    }
    for (const [element, key] of [
      [dialog, 'dialog'],
      [header, 'header'],
      [footer, 'footer'],
      [input, 'input']
    ]) {
      vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => ({
        ...bounds[key],
        x: bounds[key].left ?? 0,
        y: bounds[key].top,
        height: bounds[key].bottom - bounds[key].top,
        toJSON: () => ({})
      }))
    }

    await user.click(input)
    await screen.findByText('Coca Cola 600ml')
    const list = dialog.querySelector('div[style]')
    expect(list.style.top).toBe('244px')

    bounds.input = { ...bounds.input, top: 380, bottom: 420 }
    fireEvent(window, new Event('resize'))

    expect(list.style.bottom).toBe('224px')
    expect(list.style.maxHeight).toBe('192px')
  })

  it('muestra el impuesto solo si no incluye impuestos', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    setup()
    expect(
      screen.queryByLabelText(/impuesto/i, { selector: 'input[type=number]' })
    ).toBeNull()
    await user.click(screen.getByRole('checkbox'))
    expect(
      screen.getByLabelText(/impuesto/i, { selector: 'input[type=number]' })
    ).toBeInTheDocument()
  })
})
