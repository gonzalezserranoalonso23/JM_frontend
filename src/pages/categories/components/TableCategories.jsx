import ActionIconButton from '@/components/ActionIconButton'
import DataList, { Column } from '@/components/DataList'

const TableCategories = ({
  categories,
  total,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  handleUpdate,
  handleDelete
}) => (
  <DataList
    rows={categories}
    rowKey={(category) => category?._id}
    total={total}
    hasNextPage={hasNextPage}
    fetchNextPage={fetchNextPage}
    isFetchingNextPage={isFetchingNextPage}
  >
    <Column header="Categoría" primary>
      {(category) => category?.categories}
    </Column>
    <Column header="Opciones" align="center" actions>
      {(category) => (
        <>
          <ActionIconButton
            action="edit"
            label="Editar"
            onClick={() => handleUpdate(category)}
          />
          <ActionIconButton
            action="delete"
            label="Eliminar"
            onClick={() => handleDelete(category?._id)}
          />
        </>
      )}
    </Column>
  </DataList>
)

export default TableCategories
