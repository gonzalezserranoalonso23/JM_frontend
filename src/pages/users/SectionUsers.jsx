import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import {
  useGetUserPages,
  useRegisterUser,
  useUpdateUser,
  useDeleteUser
} from '@/features/users.features'
import Loading from '@/ui/Loading'
import ModalUsers from './components/ModalUsers'
import InfiniteScrollFooter from '@/components/InfiniteScrollFooter'
import useFilterQuery from '@/hooks/useFilterQuery'
import FormFilter from '@/components/FormFilter'
import ActionIconButton from '@/components/ActionIconButton'

const SectionUsers = () => {
  const [search, setSearch] = useFilterQuery()
  const {
    data: userPages,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetUserPages(search)
  const users = userPages?.pages.flatMap((page) => page.data) || []
  const totalUsers = userPages?.pages[0]?.total || 0
  const registerUser = useRegisterUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [modalShow, setModalShow] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [update, setUpdate] = useState(false)

  const handleClose = () => setModalShow(false)
  const handleShowCreate = () => {
    setSelectedUser(null)
    setUpdate(false)
    setModalShow(true)
  }
  const handleShowEdit = (user) => {
    setSelectedUser(user)
    setUpdate(true)
    setModalShow(true)
  }
  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este usuario?')) deleteUser.mutate(id)
  }

  if (isLoading) return <Loading />
  if (isError)
    return (
      <Alert variant="destructive" className="m-8 w-auto">
        Error al cargar los usuarios
      </Alert>
    )

  return (
    <Card
      role="region"
      aria-labelledby="users-title"
      className="gap-4 p-4 sm:p-6"
    >
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 id="users-title" className="text-xl font-semibold">
            Usuarios
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestión de cuentas del sistema
          </p>
        </div>
        <Button onClick={handleShowCreate}>+ Nuevo Usuario</Button>
      </header>

      {/* Modal */}
      <ModalUsers
        user={selectedUser}
        modalShow={modalShow}
        handleClose={handleClose}
        action={update ? updateUser : registerUser}
        type={update ? 'Editar' : 'Crear'}
        setUpdate={setUpdate}
      />

      {/* Filtro */}
      <FormFilter
        id="user-filter"
        label="Buscar usuario"
        value={search}
        onChange={setSearch}
      />

      {/* Tabla */}
      {totalUsers > 0 ? (
        <div>
          <div className="space-y-3 lg:hidden">
            {users.map((user) => (
              <Card key={user._id} className="gap-3 py-4">
                <CardContent className="space-y-3 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-medium">{user.username}</p>
                      <p className="break-words text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Badge
                      variant={user.isAdmin ? 'outline' : 'secondary'}
                      className={
                        user.isAdmin ? 'shrink-0 text-amber-400' : 'shrink-0'
                      }
                    >
                      {user.isAdmin ? 'Admin' : 'Usuario'}
                    </Badge>
                  </div>
                  {user.fullName && (
                    <p className="break-words text-sm">{user.fullName}</p>
                  )}
                  <div className="flex items-center justify-end gap-2 border-t pt-3">
                    <ActionIconButton
                      action="edit"
                      label="Editar"
                      onClick={() => handleShowEdit(user)}
                    />
                    <ActionIconButton
                      action="delete"
                      label="Eliminar"
                      onClick={() => handleDelete(user._id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="hidden rounded-lg border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nombre completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <strong>{user.username}</strong>
                    </TableCell>
                    <TableCell>
                      {user.fullName || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <small>{user.email}</small>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isAdmin ? 'outline' : 'secondary'}
                        className={user.isAdmin ? 'text-amber-400' : undefined}
                      >
                        {user.isAdmin ? 'Admin' : 'Usuario'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                        <ActionIconButton
                          action="edit"
                          label="Editar"
                          onClick={() => handleShowEdit(user)}
                        />
                        <ActionIconButton
                          action="delete"
                          label="Eliminar"
                          onClick={() => handleDelete(user._id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <caption className="mt-2 pb-2 text-sm text-muted-foreground">
                Total: {totalUsers} usuario{totalUsers !== 1 ? 's' : ''}
              </caption>
            </Table>
          </div>
          <InfiniteScrollFooter
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        </div>
      ) : (
        <Alert>
          {search
            ? 'No se encontraron usuarios con esa búsqueda'
            : 'No hay usuarios registrados'}
        </Alert>
      )}
    </Card>
  )
}

export default SectionUsers
