import { formatQty, roundTo, yieldToMain } from '@/utils/commonFunctions'
import { isoDay } from '@/utils/dateDisplay'
import { isIssueRecord, movementPrices } from '@/utils/typeInventory'

const HEADER_STYLE = { fontWeight: 'bold', backgroundColor: '#fbbf24' }
const EXPORT_CHUNK_SIZE = 250

const headerCell = (value) => ({ value, ...HEADER_STYLE })

const moneyCell = (value) =>
  value == null
    ? { value: '', type: String }
    : { value: roundTo(value, 2), type: Number, format: '#,##0.00' }

const toMovementRow = (record, includeProfit) => {
  const prices =
    includeProfit && isIssueRecord(record) ? movementPrices(record) : null
  return [
    { value: isoDay(record.date), type: String },
    { value: record.productName?.productName || '', type: String },
    {
      value:
        record.typeInventory?.typeInventory ||
        (isIssueRecord(record) ? 'Salida' : 'Entrada'),
      type: String
    },
    { value: formatQty(record.quantity), type: Number, format: '#,##0.000' },
    ...(includeProfit
      ? [
          moneyCell(prices?.purchasePrice),
          moneyCell(prices?.productPrice),
          moneyCell(prices?.profit)
        ]
      : [
          {
            value: roundTo(record.productPrice, 3),
            type: Number,
            format: '#,##0.000'
          }
        ]),
    {
      value: roundTo(record.totalAmount, 2),
      type: Number,
      format: '#,##0.00'
    },
    { value: record.paymentType?.paymentType || '', type: String }
  ]
}

const mapRecordsInChunks = async (records, includeProfit) => {
  const rows = []
  for (let index = 0; index < records.length; index += EXPORT_CHUNK_SIZE) {
    const chunk = records.slice(index, index + EXPORT_CHUNK_SIZE)
    for (const record of chunk) rows.push(toMovementRow(record, includeProfit))
    if (index + EXPORT_CHUNK_SIZE < records.length) await yieldToMain()
  }
  return rows
}

// La librería se carga solo al exportar para no aumentar el bundle inicial.
export const exportMovementsToExcel = async (
  records,
  fileName,
  { includeProfit = false } = {}
) => {
  const { default: writeExcelFile } = await import('write-excel-file/browser')

  const header = [
    'Fecha',
    'Producto',
    'Tipo',
    'Cantidad',
    ...(includeProfit
      ? ['Precio de compra', 'Precio de venta', 'Utilidad']
      : ['Precio unitario']),
    'Total',
    'Tipo de pago'
  ].map(headerCell)

  const rows = await mapRecordsInChunks(records, includeProfit)

  const columns = [
    { width: 12 },
    { width: 30 },
    { width: 10 },
    { width: 10 },
    ...(includeProfit
      ? [{ width: 16 }, { width: 16 }, { width: 14 }]
      : [{ width: 16 }]),
    { width: 14 },
    { width: 14 }
  ]

  await writeExcelFile([header, ...rows], { columns }).toFile(fileName)
}
