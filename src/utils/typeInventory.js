export const isExitType = (type) => Number(type?.stockDirection) === -1

// Un registro llega con typeInventory poblado: { _id, typeInventory, stockDirection }
export const isIssueRecord = (record) => isExitType(record?.typeInventory)
