import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGetDailyInformation } from '@/features/dailyInformation.features'
import DailyInformationDashboard from './DailyInformationDashboard'

vi.mock('@/features/dailyInformation.features', () => ({
  useGetDailyInformation: vi.fn()
}))

vi.mock('@/utils/dateDisplay', () => ({
  yesterdayMexicoCity: () => '2026-10-15'
}))

describe('DailyInformationDashboard', () => {
  afterEach(() => {
    cleanup()
  })

  it('abre en el día anterior', () => {
    useGetDailyInformation.mockReturnValue({
      data: {
        _id: 'today',
        date: '2026-10-15',
        cashSales: 900,
        cardSales: 0,
        totalSales: 900,
        totalTransactions: 1
      },
      isLoading: false,
      isError: false
    })

    render(<DailyInformationDashboard />)

    expect(
      screen.getByRole('heading', { name: 'Ventas anteriores' })
    ).toBeTruthy()
    expect(useGetDailyInformation).toHaveBeenCalledWith('2026-10-15')
    expect(screen.getByLabelText('Fecha')).toHaveValue('2026-10-15')
    expect(screen.getAllByText('$900.00')).toHaveLength(2)
    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(
      ['Ventas totales', 'Efectivo', 'Tarjeta', 'Transacciones']
    )
  })

  it('shows a notice when that day has no record', () => {
    useGetDailyInformation.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false
    })

    render(<DailyInformationDashboard />)

    expect(
      screen.getByText('No hay ventas anteriores para esta fecha.')
    ).toBeTruthy()
  })
})
