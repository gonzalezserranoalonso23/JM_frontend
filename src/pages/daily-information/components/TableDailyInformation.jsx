import ActionIconButton from '@/components/molecules/ActionIconButton'
import DataList, { Column } from '@/components/organisms/DataList'
import { formatCurrency } from '@/utils/commonFunctions'

const TableDailyInformation = ({
  records,
  total = records.length,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  handleUpdate,
  handleDelete,
  canManage = false
}) => (
  <DataList
    rows={records}
    rowKey={(record) => record._id}
    total={total}
    hasNextPage={hasNextPage}
    fetchNextPage={fetchNextPage}
    isFetchingNextPage={isFetchingNextPage}
    totalLabel={`Total: ${total} registros`}
  >
    <Column header="Fecha" primary>
      {(record) => record.date}
    </Column>
    <Column header="Efectivo" align="right">
      {(record) => formatCurrency(record.cashSales)}
    </Column>
    <Column header="Tarjeta" align="right">
      {(record) => formatCurrency(record.cardSales)}
    </Column>
    <Column header="Ventas totales" align="right">
      {(record) => formatCurrency(record.totalSales)}
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
