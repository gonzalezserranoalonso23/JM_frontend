export const ORDER_STATUS = {
  pending: 'pendiente',
  confirmed: 'confirmado'
}

export const statusOrPending = (status) => status || ORDER_STATUS.pending

export const isConfirmed = (status) => status === ORDER_STATUS.confirmed

export const toggledStatus = (status) =>
  isConfirmed(status) ? ORDER_STATUS.pending : ORDER_STATUS.confirmed
