// Un registro llega con typeInventory poblado: { _id, typeInventory, stockDirection }
export const isIssueRecord = (record) =>
  Number(record?.typeInventory?.stockDirection) === -1

export const isEntryRecord = (record) =>
  Number(record?.typeInventory?.stockDirection) === 1
