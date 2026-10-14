import { isoDay } from '@/utils/dateDisplay'
import { isIssueRecord } from '@/utils/typeInventory'

const HEADER_STYLE = { fontWeight: 'bold', backgroundColor: '#fbbf24' }

const toNumber = (value) => {
  const number = parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

const headerCell = (value) => ({ value, ...HEADER_STYLE })

// La librería se carga solo al exportar para no aumentar el bundle inicial.
export const exportMovementsToExcel = async (records, fileName) => {
  const { default: writeExcelFile } = await import('write-excel-file/browser')

  const header = [
    'Fecha',
    'Producto',
    'Tipo',
    'Cantidad',
    'Precio unitario',
    'Total',
    'Tipo de pago'
  ].map(headerCell)

  const rows = records.map((record) => [
    { value: isoDay(record.date), type: String },
    { value: record.productName?.productName || '', type: String },
    {
      value:
        record.typeInventory?.typeInventory ||
        (isIssueRecord(record) ? 'Salida' : 'Entrada'),
      type: String
    },
    { value: toNumber(record.quantity), type: Number },
    { value: toNumber(record.productPrice), type: Number, format: '#,##0.00' },
    { value: toNumber(record.totalAmount), type: Number, format: '#,##0.00' },
    { value: record.paymentType?.paymentType || '', type: String }
  ])

  const columns = [
    { width: 12 },
    { width: 30 },
    { width: 10 },
    { width: 10 },
    { width: 16 },
    { width: 14 },
    { width: 14 }
  ]

  await writeExcelFile([header, ...rows], { columns }).toFile(fileName)
}
