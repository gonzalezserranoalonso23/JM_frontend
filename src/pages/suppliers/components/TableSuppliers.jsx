import ActionIconButton from '@/components/ActionIconButton'
import DataList, { Column } from '@/components/DataList'
import { Badge } from '@/components/ui/badge'

const callHref = (phone) => {
  const compact = String(phone).replace(/[^\d+]/g, '')
  if (!compact || compact === '+') return ''
  return `tel:${compact}`
}

const PhoneLink = ({ phone, empty = null }) => {
  const value = String(phone || '').trim()
  if (!value) return empty
  const href = callHref(value)
  if (!href) return value
  return (
    <a href={href} className="text-primary underline-offset-4 hover:underline">
      {value}
    </a>
  )
}

const ActiveBadge = ({ supplier }) => (
  <Badge
    variant={supplier?.isActive ? 'outline' : 'destructive'}
    className={supplier?.isActive ? 'shrink-0 text-emerald-400' : 'shrink-0'}
  >
    {supplier?.isActive ? 'Activo' : 'Inactivo'}
  </Badge>
)

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
      {(supplier) => supplier?.suppliersContact || '-'}
    </Column>
    <Column header="Teléfono">
      {(supplier) => <PhoneLink phone={supplier?.supplierPhone} empty="-" />}
    </Column>
    <Column header="Pedido">{(supplier) => supplier?.raiseOrder || '-'}</Column>
    <Column header="Entrega">
      {(supplier) => supplier?.deliverOrder || '-'}
    </Column>
    <Column header="Activo" aside>
      {(supplier) => <ActiveBadge supplier={supplier} />}
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
