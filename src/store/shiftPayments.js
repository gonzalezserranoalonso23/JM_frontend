import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { roundTo } from '@/utils/commonFunctions'

const STORAGE_KEY = 'jm-shift-payments'
const LEGACY_PREFIX = 'jm-shift-payments:'
const EMPTY_PAYMENTS = []

const normalizePayment = (payment) => {
  const supplier = String(payment?.supplier || '')
  const amount = Number(payment?.amount)
  if (!supplier || !Number.isFinite(amount) || amount < 0) return null
  return { supplier, amount: roundTo(amount, 2) }
}

const takeLegacyPayments = () => {
  if (typeof localStorage === 'undefined') return {}
  const byShift = {}
  const keys = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(LEGACY_PREFIX)) keys.push(key)
  }
  keys.forEach((key) => {
    const shiftId = key.slice(LEGACY_PREFIX.length)
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]')
      const payments = Array.isArray(parsed)
        ? parsed.map(normalizePayment).filter(Boolean)
        : []
      if (shiftId && payments.length > 0) byShift[shiftId] = payments
    } catch {
      // Un borrador dañado no se recupera.
    }
    localStorage.removeItem(key)
  })
  return byShift
}

export const useShiftPaymentsStore = create(
  persist(
    (set, get) => ({
      byShift: {},
      addPayment: (shiftId, payment) => {
        const next = normalizePayment(payment)
        if (!shiftId || !next) return
        const current = get().byShift[shiftId] ?? EMPTY_PAYMENTS
        set({
          byShift: {
            ...get().byShift,
            [shiftId]: [...current, next]
          }
        })
      },
      removePayment: (shiftId, index) => {
        const current = get().byShift[shiftId]
        if (!shiftId || !current) return
        set({
          byShift: {
            ...get().byShift,
            [shiftId]: current.filter((_, item) => item !== index)
          }
        })
      },
      clearShift: (shiftId) => {
        if (!shiftId || !get().byShift[shiftId]) return
        const byShift = { ...get().byShift }
        delete byShift[shiftId]
        set({ byShift })
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ byShift: state.byShift }),
      onRehydrateStorage: () => (state) => {
        const legacy = takeLegacyPayments()
        if (!state || Object.keys(legacy).length === 0) return
        useShiftPaymentsStore.setState((current) => ({
          byShift: { ...legacy, ...current.byShift }
        }))
      }
    }
  )
)

export const useShiftPayments = (shiftId) =>
  useShiftPaymentsStore(
    useShallow((state) => ({
      payments: state.byShift[shiftId] ?? EMPTY_PAYMENTS,
      addPayment: state.addPayment,
      removePayment: state.removePayment,
      clearShift: state.clearShift
    }))
  )
