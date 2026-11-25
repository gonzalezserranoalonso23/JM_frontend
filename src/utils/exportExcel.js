import { roundTo, yieldToMain } from '@/utils/commonFunctions'
import { isoDay } from '@/utils/dateDisplay'

const HEADER_STYLE = { fontWeight: 'bold', backgroundColor: '#fbbf24' }
const EXPORT_CHUNK_SIZE = 250

const headerCell = (value) => ({ value, ...HEADER_STYLE })

const moneyCell = (value) =>
  value == null
    ? { value: '', type: String }
    : { value: roundTo(value, 2), type: Number, format: '#,##0.00' }

const mapInChunks = async (records, toRow) => {
  const rows = []
  for (let index = 0; index < records.length; index += EXPORT_CHUNK_SIZE) {
    const chunk = records.slice(index, index + EXPORT_CHUNK_SIZE)
    for (const record of chunk) rows.push(toRow(record))
    if (index + EXPORT_CHUNK_SIZE < records.length) await yieldToMain()
  }
  return rows
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

const toDailyInformationRow = (record) => [
  textCell(isoDay(record?.date)),
  moneyCell(record?.cashSales),
  moneyCell(record?.cardSales),
  moneyCell(record?.totalSales),
  qtyCell(record?.totalTransactions)
]

export const exportDailyInformationToExcel = async (
  records,
  fileName
) => {
  const rows = await mapInChunks(records, toDailyInformationRow)
  await writeSheet(
    ['Fecha', 'Efectivo', 'Tarjeta', 'Ventas totales', 'Transacciones'],
    rows,
    [{ width: 12 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 16 }],
    fileName
  )
}
