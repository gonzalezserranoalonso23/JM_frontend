import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGetLiveInformation } from '@/features/inventory.features'
import TodaySalesCard from './TodaySalesCard'

vi.mock('@/features/inventory.features', () => ({
  useGetLiveInformation: vi.fn()
}))

vi.mock('@/utils/dateDisplay', () => ({
  todayLocal: () => '2026-10-23'
}))

describe('TodaySalesCard', () => {
  afterEach(() => cleanup())

  it('pide las ventas con la fecha del dispositivo', () => {
    useGetLiveInformation.mockReturnValue({
      data: { cashSales: 150.5, cardSales: 49.5, totalSales: 200 },
      isLoading: false,
      isError: false
    })

    render(<TodaySalesCard />)

    expect(useGetLiveInformation).toHaveBeenCalledWith('2026-10-23')
    expect(screen.getByText('$150.50')).toBeTruthy()
    expect(screen.getByText('$49.50')).toBeTruthy()
    expect(screen.getByText('$200.00')).toBeTruthy()
  })
})