import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ModalDailyInformation from './daily-information/components/ModalDailyInformation'
import ModalProducts from './products/components/ModalProducts'
import ModalSuppliers from './suppliers/components/ModalSuppliers'
import ModalUsers from './users/components/ModalUsers'
import ScheduleModal from './users/components/ScheduleModal'

vi.mock('@/features/categories.features', () => ({
  useGetCategories: () => ({
    data: [{ _id: 'category-1', categories: 'Abarrotes' }],
    isLoading: false
  })
}))

vi.mock('@/features/suppliers.features', () => ({
  useGetSuppliers: () => ({
    data: [{ _id: 'supplier-1', suppliersName: 'Proveedor' }],
    isLoading: false
  })
}))

const action = () => ({ mutate: vi.fn(), isPending: false })

describe('modales de captura', () => {
  it('daily information transforma los importes y envía el registro', () => {
    const api = action()
    render(
      <ModalDailyInformation
        modalShow
        record={null}
        action={api}
        handleClose={vi.fn()}
      />
    )

    fireEvent.change(screen.getByLabelText('Ventas en efectivo'), {
      target: { value: '100' }
    })
    fireEvent.change(screen.getByLabelText('Ventas con tarjeta'), {
      target: { value: '50' }
    })
    fireEvent.change(screen.getByLabelText('Total de transacciones'), {
      target: { value: '3' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar registro' }))

    expect(api.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        cashSales: 100,
        cardSales: 50,
        totalSales: 150,
        totalTransactions: 3
      }),
      expect.any(Object)
    )
  })

  it('products renderiza catálogos mockeados y datos del formulario', () => {
    render(
      <ModalProducts
        modalShow
        product={{ productName: 'Arroz', supplier: 'supplier-1', category: 'category-1' }}
        action={action()}
        type="Editar"
        setUpdate={vi.fn()}
        handleClose={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Editar producto' })).toBeTruthy()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Arroz')
    expect(screen.getByRole('combobox', { name: 'Proveedor' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toBeTruthy()
  })

  it('suppliers envía los valores capturados con el mock de acción', async () => {
    const api = action()
    render(
      <ModalSuppliers
        modalShow
        supplier={null}
        action={api}
        type="Crear"
        setUpdate={vi.fn()}
        handleClose={vi.fn()}
      />
    )
    fireEvent.change(screen.getByLabelText('Nombre del Proveedor'), {
      target: { value: 'Proveedor nuevo' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear proveedor' }))
    await waitFor(() =>
      expect(api.mutate).toHaveBeenCalledWith(
        expect.objectContaining({ suppliersName: 'Proveedor nuevo' }),
        expect.any(Object)
      )
    )
  })

  it('users conserva isAdmin booleano en el formulario', () => {
    const api = action()
    render(
      <ModalUsers
        modalShow
        user={null}
        action={api}
        type="Crear"
        setUpdate={vi.fn()}
        handleClose={vi.fn()}
      />
    )
    const admin = screen.getByRole('checkbox', { name: 'Es administrador' })
    expect(admin).not.toBeChecked()
    fireEvent.click(admin)
    expect(admin).toBeChecked()
  })

  it('schedule muestra la información del usuario y permite cerrar', () => {
    const onClose = vi.fn()
    render(
      <ScheduleModal
        open
        user={{ username: 'usuario', fullName: 'Usuario Demo', schedule: {} }}
        onClose={onClose}
      />
    )
    expect(screen.getByRole('heading', { name: /Horario de Usuario Demo/ })).toBeTruthy()
    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar' })[0])
    expect(onClose).toHaveBeenCalled()
  })
})
