import ActionIconButton from '@/components/molecules/ActionIconButton'
import DataList, { Column } from '@/components/organisms/DataList'
import SupplierActive from './SupplierActive'
import SupplierPhone from './SupplierPhone'

const dash = (value) => value || '-'

const TableSuppliers = ({
  suppliers,
  total,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  handleUpdate,
  handleDelete,
  canManage = true
}) => (
  <DataList
    rows={suppliers}
    rowKey={(supplier) => supplier?._id}
    total={total}
    hasNextPage={hasNextPage}
    fetchNextPage={fetchNextPage}
    isFetchingNextPage={isFetchingNextPage}
  >
    <Column header="Proveedor" primary>
      {(supplier) => supplier?.suppliersName}
    </Column>
    <Column header="Contacto">
      {(supplier) => dash(supplier?.suppliersContact)}
    </Column>
    <Column header="Teléfono">
      {(supplier) => <SupplierPhone phone={supplier?.supplierPhone} />}
    </Column>
    <Column header="Pedido">{(supplier) => dash(supplier?.raiseOrder)}</Column>
    <Column header="Entrega">
      {(supplier) => dash(supplier?.deliverOrder)}
    </Column>
    <Column header="Activo" aside>
      {(supplier) => <SupplierActive active={supplier?.isActive} />}
    </Column>
    {canManage && (
      <Column header="Opciones" align="center" actions>
        {(supplier) => (
          <>
            <ActionIconButton
              action="edit"
              label="Editar"
              onClick={() => handleUpdate(supplier)}
            />
            <ActionIconButton
              action="delete"
              label="Eliminar"
              onClick={() => handleDelete(supplier?._id)}
            />
          </>
        )}
      </Column>
    )}
  </DataList>
)

export default TableSuppliers
