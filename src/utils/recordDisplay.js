import { formatDate } from './dateDisplay'
import { formatMoney, formatQty } from './commonFunctions'
import { isIssueRecord, movementPrices } from './typeInventory'

const moneyOrDash = (value) => (value == null ? '-' : formatMoney(value))

export const recordCardView = (
  record,
  { showProfit = false, showPayment = false } = {}
) => {
  const prices =
    showProfit && isIssueRecord(record) ? movementPrices(record) : null

  return {
    name: record.productName?.productName,
    date: formatDate(record.date),
    type: record.typeInventory?.typeInventory,
    quantity: formatQty(record.quantity),
    profit: prices
      ? {
          purchase: moneyOrDash(prices.purchasePrice),
          sale: moneyOrDash(prices.productPrice),
          amount: moneyOrDash(prices.profit)
        }
      : null,
    price: formatQty(record.productPrice),
    total: formatMoney(record.totalAmount),
    payment: showPayment ? record.paymentType?.paymentType || '-' : null
  }
}
