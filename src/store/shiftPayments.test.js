import { beforeEach, describe, expect, it } from 'vitest'
import { useShiftPaymentsStore } from '@/store/shiftPayments'

describe('pagos del turno', () => {
  beforeEach(async () => {
    localStorage.clear()
    useShiftPaymentsStore.setState({ byShift: {} })
    await useShiftPaymentsStore.persist.rehydrate()
    useShiftPaymentsStore.setState({ byShift: {} })
  })

  it('guarda cada proveedor con los métodos del store', () => {
    const { addPayment, removePayment, clearShift } =
      useShiftPaymentsStore.getState()

    addPayment('turno-1', { supplier: 'abastos', amount: 700 })
    addPayment('turno-1', { supplier: 'bimbo', amount: 500 })
    expect(useShiftPaymentsStore.getState().byShift['turno-1']).toEqual([
      { supplier: 'abastos', amount: 700 },
      { supplier: 'bimbo', amount: 500 }
    ])

    removePayment('turno-1', 0)
    expect(useShiftPaymentsStore.getState().byShift['turno-1']).toEqual([
      { supplier: 'bimbo', amount: 500 }
    ])

    clearShift('turno-1')
    expect(useShiftPaymentsStore.getState().byShift['turno-1']).toBeUndefined()
    expect(useShiftPaymentsStore.getState().byShift['turno-2']).toBeUndefined()
  })

  it('persiste el objeto en localStorage a través de Zustand', () => {
    useShiftPaymentsStore
      .getState()
      .addPayment('turno-1', { supplier: 'abastos', amount: 10 })

    const stored = JSON.parse(localStorage.getItem('jm-shift-payments'))
    expect(stored.state.byShift['turno-1']).toEqual([
      { supplier: 'abastos', amount: 10 }
    ])
  })
})
