import { toast } from 'react-hot-toast'
import { formatMoney } from '@/utils/commonFunctions'

const readPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Este dispositivo no puede compartir la ubicación'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
      () =>
        reject(
          new Error(
            'Activa la ubicación para registrar la entrada en el trabajo'
          )
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  })

const punchAtWork = (mutate, extra) => {
  readPosition().then(
    (position) => mutate({ ...position, ...extra }),
    (error) => toast.error(error.message)
  )
}

export const confirmPunch = ({
  open,
  dayOff,
  amount,
  payments,
  checkIn,
  checkOut
}) => {
  if (dayOff) return
  if (open) {
    if (
      !window.confirm(
        `¿Registrar tu salida con corte de ${formatMoney(amount)}?`
      )
    )
      return
    punchAtWork(checkOut.mutate, {
      cashCut: amount,
      supplierPayments: (payments ?? []).map((payment) => ({
        supplier: payment.supplier,
        amount: payment.amount
      }))
    })
    return
  }
  if (
    !window.confirm(`¿Registrar tu entrada con ${formatMoney(amount)} en caja?`)
  )
    return
  punchAtWork(checkIn.mutate, { cashReceived: amount })
}
