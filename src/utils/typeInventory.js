export const isExitType = (type) => Number(type?.stockDirection) === -1

// Un registro llega con typeInventory poblado: { _id, typeInventory, stockDirection }
export const isIssueRecord = (record) => isExitType(record?.typeInventory)

const priceOf = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

// Solo las salidas tienen utilidad: el precio cobrado está en el registro
// y el costo en el producto.
export const movementPrices = (record) => {
  if (!isIssueRecord(record)) {
    return { purchasePrice: null, productPrice: null, profit: null }
  }
  const purchasePrice = priceOf(record?.productName?.purchasePrice)
  const productPrice = priceOf(record?.productPrice)
  const quantity = Number(record?.quantity) || 0
  const profit =
    purchasePrice == null || productPrice == null
      ? null
      : (productPrice - purchasePrice) * quantity

  return { purchasePrice, productPrice, profit }
}
