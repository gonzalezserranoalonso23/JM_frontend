import { Alert } from '@/components/atoms/alert'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import ActionIconButton from '@/components/molecules/ActionIconButton'
import ListSkeleton from '@/components/molecules/ListSkeleton'
import DataList, { Column } from '@/components/organisms/DataList'
import {
  useCreateRole,
  useDeleteRole,
  useGetRoles,
  useUpdateRole
} from '@/features/roles.features'
import { useCatalogEditor } from '@/hooks/useCatalogEditor'
import ModalRoles from './ModalRoles'

const SectionRoles = () => {
  const { data: roles, isLoading, isError } = useGetRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const {
    modalShow,
    item: role,
    editing: update,
    setEditing: setUpdate,
    openCreate,
    openEdit,
    close,
    remove
  } = useCatalogEditor()

  return (
    <Card as="section" aria-labelledby="roles-title" className="gap-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 id="roles-title" className="text-xl font-semibold">
          Roles
        </h1>
        <Button onClick={openCreate}>+ Crear rol</Button>
      </header>
      <ModalRoles
        role={update ? role : null}
        modalShow={modalShow}
        handleClose={close}
        action={update ? updateRole : createRole}
        type={update ? 'Editar' : 'Crear'}
        setUpdate={setUpdate}
      />
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <Alert variant="destructive">Error al cargar los roles</Alert>
      ) : roles.length > 0 ? (
        <DataList rows={roles} rowKey={(item) => item._id} total={roles.length}>
          <Column header="Rol" primary>
            {(item) => item.name}
          </Column>
          <Column header="Opciones" align="center" actions>
            {(item) =>
              item.locked ? (
                <span className="text-sm text-muted-foreground">Sistema</span>
              ) : (
                <>
                  <ActionIconButton
                    action="edit"
                    label="Editar"
                    onClick={() => openEdit(item)}
                  />
                  <ActionIconButton
                    action="delete"
                    label="Eliminar"
                    onClick={() => remove(deleteRole.mutate, item._id)}
                  />
                </>
              )
            }
          </Column>
        </DataList>
      ) : (
        <Alert>No hay roles para mostrar</Alert>
      )}
    </Card>
  )
}

export default SectionRoles
