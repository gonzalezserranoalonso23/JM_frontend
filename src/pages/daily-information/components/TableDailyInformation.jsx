import ActionIconButton from '@/components/ActionIconButton'
import DataList, { Column } from '@/components/DataList'

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  })

const TableDailyInformation = ({
  records,
  handleUpdate,
  handleDelete,
  canManage = false
}) => (
  <DataList
    rows={records}
    rowKey={(record) => record._id}
    totalLabel={`Total: ${records.length} registros`}
  >
    <Column header="Fecha" primary>
      {(record) => record.date}
    </Column>
    <Column header="Efectivo" align="right">
      {(record) => formatAmount(record.cashSales)}
    </Column>
    <Column header="Tarjeta" align="right">
      {(record) => formatAmount(record.cardSales)}
    </Column>
    <Column header="Ventas totales" align="right">
      {(record) => formatAmount(record.totalSales)}
    </Column>
    <Column header="Transacciones" align="center">
      {(record) => record.totalTransactions}
    </Column>
    {canManage && (
      <Column header="Acciones" align="center" actions>
        {(record) => (
          <>
            <ActionIconButton
              action="edit"
              label="Editar"
              onClick={() => handleUpdate(record)}
            />
            <ActionIconButton
              action="delete"
              label="Eliminar"
              onClick={() => handleDelete(record._id)}
            />
          </>
        )}
      </Column>
    )}
  </DataList>
)

export default TableDailyInformation
