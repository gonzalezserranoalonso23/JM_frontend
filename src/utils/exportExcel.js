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

const mapInChunks = async (records, toRow) => {
  const rows = []
  for (let index = 0; index < records.length; index += EXPORT_CHUNK_SIZE) {
    const chunk = records.slice(index, index + EXPORT_CHUNK_SIZE)
    for (const record of chunk) rows.push(toRow(record))
    if (index + EXPORT_CHUNK_SIZE < records.length) await yieldToMain()
  }
  return rows
}

const mapRecordsInChunks = (records, includeProfit) =>
  mapInChunks(records, (record) => toMovementRow(record, includeProfit))

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

const textCell = (value) => ({
  value: value ? String(value) : '',
  type: String
})

const qtyCell = (value) => ({
  value: roundTo(value, 3),
  type: Number,
  format: '#,##0.000'
})

const supplierName = (product) =>
  product?.supplier?.suppliersName || product?.supplier?.name || ''

const categoryName = (product) => product?.category?.categories || ''

const toProductRow = (product) => [
  textCell(product?.productName),
  textCell(product?.productDescription),
  moneyCell(product?.purchasePrice),
  moneyCell(product?.productPrice),
  qtyCell(product?.productStock),
  qtyCell(product?.minimumProductStock),
  textCell(supplierName(product)),
  textCell(categoryName(product)),
  textCell(product?.isActive === false ? 'Desactivado' : 'Activado')
]

const toPromotionRow = (product) => [
  textCell(product?.productName),
  textCell(product?.productDescription),
  textCell(categoryName(product)),
  moneyCell(product?.purchasePrice),
  moneyCell(product?.productPrice),
  {
    value: roundTo(product?.margin, 2),
    type: Number,
    format: '#,##0.00'
  }
]

const writeSheet = async (titles, rows, columns, fileName) => {
  const { default: writeExcelFile } = await import('write-excel-file/browser')
  await writeExcelFile([titles.map(headerCell), ...rows], { columns }).toFile(
    fileName
  )
}

export const exportProductsToExcel = async (products, fileName) => {
  const rows = await mapInChunks(products, toProductRow)
  await writeSheet(
    [
      'Producto',
      'Descripción',
      'Compra',
      'Venta',
      'Stock',
      'Stock mín.',
      'Proveedor',
      'Categoría',
      'Estado'
    ],
    rows,
    [
      { width: 30 },
      { width: 36 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 24 },
      { width: 20 },
      { width: 14 }
    ],
    fileName
  )
}

export const exportPromotionsToExcel = async (products, fileName) => {
  const rows = await mapInChunks(products, toPromotionRow)
  await writeSheet(
    ['Producto', 'Descripción', 'Categoría', 'Compra', 'Venta', 'Margen %'],
    rows,
    [
      { width: 30 },
      { width: 36 },
      { width: 20 },
      { width: 12 },
      { width: 12 },
      { width: 12 }
    ],
    fileName
  )
}
