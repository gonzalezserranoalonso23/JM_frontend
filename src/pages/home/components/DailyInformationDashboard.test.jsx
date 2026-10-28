import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGetDailyInformations } from '@/features/dailyInformation.features'
import DailyInformationDashboard from './DailyInformationDashboard'

vi.mock('@/features/dailyInformation.features', () => ({
  useGetDailyInformations: vi.fn()
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: () => null
}))

describe('DailyInformationDashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 16, 12))
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('shows all dates from the start date, including future records', () => {
    useGetDailyInformations.mockReturnValue({
      data: [
        {
          _id: 'start-date',
          date: '01/10/2026',
          cashSales: 10,
          cardSales: 2,
          totalSales: 12,
          totalTransactions: 1
        },
        {
          _id: 'previous-day',
          date: '15/10/2026',
          cashSales: 100,
          cardSales: 20,
          totalSales: 120,
          totalTransactions: 3
        },
        {
          _id: 'today',
          date: '2026-10-16',
          cashSales: 900,
          cardSales: 0,
          totalSales: 900,
          totalTransactions: 1
        },
        {
          _id: 'before-range',
          date: '30/09/2026',
          cashSales: 50,
          cardSales: 5,
          totalSales: 55,
          totalTransactions: 2
        },
        {
          _id: 'future',
          date: '17/10/2026',
          cashSales: 800,
          cardSales: 0,
          totalSales: 800,
          totalTransactions: 1
        }
      ],
      isLoading: false,
      isError: false
    })

    render(<DailyInformationDashboard />)

    expect(screen.getByText('15 de octubre de 2026')).toBeTruthy()
    expect(screen.getByText('16 de octubre de 2026')).toBeTruthy()
    expect(screen.getByText('1 de octubre de 2026')).toBeTruthy()
    expect(screen.getByText('17 de octubre de 2026')).toBeTruthy()
    expect(screen.queryByText('30 de septiembre de 2026')).toBeNull()
    expect(screen.getAllByText('$800.00')).toHaveLength(2)
    expect(screen.queryByText('$900.00')).toBeNull()
    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(
      ['Ventas totales', 'Efectivo', 'Tarjeta', 'Transacciones']
    )
  })

  it('shows a notice when there are no daily records', () => {
    useGetDailyInformations.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false
    })

    render(<DailyInformationDashboard />)

    expect(
      screen.getByText(
        'No hay información diaria registrada desde el 1 de octubre de 2026.'
      )
    ).toBeTruthy()
  })
})
