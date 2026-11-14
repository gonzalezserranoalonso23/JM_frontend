export const isExitType = (type) => Number(type?.stockDirection) === -1

// A record arrives with typeInventory populated: { _id, typeInventory, stockDirection }
export const isIssueRecord = (record) => isExitType(record?.typeInventory)

const priceOf = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

// Only exits have profit. The cost stored on the movement
// wins over the current catalog cost.
export const movementPrices = (record) => {
  if (!isIssueRecord(record)) {
    return { purchasePrice: null, productPrice: null, profit: null }
  }
  const purchasePrice = priceOf(
    record?.purchasePrice ?? record?.productName?.purchasePrice
  )
  const productPrice = priceOf(record?.productPrice)
  const quantity = Number(record?.quantity) || 0
  const profit =
    purchasePrice == null || productPrice == null
      ? null
      : (productPrice - purchasePrice) * quantity

  return { purchasePrice, productPrice, profit }
}
