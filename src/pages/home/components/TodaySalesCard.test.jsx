import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGetLiveInformation } from '@/features/inventory.features'
import { useGetPaymentTypes } from '@/features/paymentTypes.features'
import TodaySalesCard from './TodaySalesCard'

vi.mock('@/features/inventory.features', () => ({
  useGetLiveInformation: vi.fn()
}))

vi.mock('@/features/paymentTypes.features', () => ({
  useGetPaymentTypes: vi.fn()
}))

vi.mock('@/utils/dateDisplay', () => ({
  todayLocal: () => '2026-10-23'
}))

describe('TodaySalesCard', () => {
  afterEach(() => cleanup())

  it('muestra cada método de pago con su venta del día', () => {
    useGetPaymentTypes.mockReturnValue({
      data: [
        { value: 'cash', label: 'EFECTIVO' },
        { value: 'card', label: 'TARJETA' },
        { value: 'transfer', label: 'TRANSFERENCIA' },
        { value: 'check', label: 'CHEQUE' }
      ],
      isLoading: false,
      isError: false
    })
    useGetLiveInformation.mockReturnValue({
      data: {
        payments: [
          { paymentType: 'cash', total: 150.5 },
          { paymentType: 'card', total: 49.5 },
          { paymentType: 'transfer', total: 25 }
        ],
        totalSales: 225
      },
      isLoading: false,
      isError: false
    })

    render(<TodaySalesCard />)

    expect(useGetLiveInformation).toHaveBeenCalledWith('2026-10-23')
    expect(screen.getByText('Efectivo')).toBeTruthy()
    expect(screen.getByText('Tarjeta')).toBeTruthy()
    expect(screen.getByText('Transferencia')).toBeTruthy()
    expect(screen.getByText('Cheque')).toBeTruthy()
    expect(screen.getByText('$150.50')).toBeTruthy()
    expect(screen.getByText('$49.50')).toBeTruthy()
    expect(screen.getByText('$25.00')).toBeTruthy()
    expect(screen.getByText('$0.00')).toBeTruthy()
    expect(screen.getByText('$225.00')).toBeTruthy()
  })
})
