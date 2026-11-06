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
  useDeleteUser,
  useRevokeUserSessions
} from '@/features/users.features'
import ListSkeleton from '@/components/ListSkeleton'
import ModalUsers from './components/ModalUsers'
import InfiniteScrollFooter from '@/components/InfiniteScrollFooter'
import useFilterQuery from '@/hooks/useFilterQuery'
import FormFilter from '@/components/FormFilter'
import ActionIconButton from '@/components/ActionIconButton'
import ScheduleModal from './components/ScheduleModal'
import { hasFullAccess } from '@/auth/access'
import { hasSchedule } from './schedule'

const RoleBadge = ({ user }) => {
  const name = user.role?.name
  let label = '—'
  let variant = 'secondary'
  let className = 'shrink-0'
  if (name) {
    label = name
    if (name === 'Manager') {
      variant = 'outline'
      className = 'shrink-0 text-amber-400'
    }
  }
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

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
  const revokeSessions = useRevokeUserSessions()

  const [modalShow, setModalShow] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [update, setUpdate] = useState(false)
  const [scheduleUser, setScheduleUser] = useState(null)

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
  const handleRevoke = (user) => {
    if (hasFullAccess(user.role?.name)) return
    if (
      !window.confirm(
        `¿Cerrar las sesiones de ${user.username}? Tendrá que volver a entrar.`
      )
    )
      return
    revokeSessions.mutate(user._id)
  }

  return (
    <Card
      as="section"
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
      <ScheduleModal
        user={scheduleUser}
        open={Boolean(scheduleUser)}
        onClose={() => setScheduleUser(null)}
      />

      {/* Filtro */}
      <FormFilter
        id="user-filter"
        label="Buscar usuario"
        value={search}
        onChange={setSearch}
      />

      {/* Tabla */}
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <Alert variant="destructive">Error al cargar los usuarios</Alert>
      ) : totalUsers > 0 ? (
        <div>
          <div className="space-y-3 xl:hidden">
            {users.map((user) => (
              <Card as="article" key={user._id} className="gap-3 py-4">
                <CardContent className="space-y-3 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-medium">
                        {user.username}
                      </h2>
                      <p className="break-words text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <RoleBadge user={user} />
                  </div>
                  {user.fullName && (
                    <p className="break-words text-sm">{user.fullName}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">
                    {hasSchedule(user) && (
                      <ActionIconButton
                        action="schedule"
                        label="Ver horario"
                        onClick={() => setScheduleUser(user)}
                      />
                    )}
                    <ActionIconButton
                      action="edit"
                      label="Editar"
                      onClick={() => handleShowEdit(user)}
                    />
                    {!hasFullAccess(user.role?.name) && (
                      <ActionIconButton
                        action="logout"
                        label="Cerrar sesiones"
                        disabled={revokeSessions.isPending}
                        onClick={() => handleRevoke(user)}
                      />
                    )}
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
          <div className="hidden rounded-lg border xl:block">
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
                      <RoleBadge user={user} />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                        {hasSchedule(user) && (
                          <ActionIconButton
                            action="schedule"
                            label="Ver horario"
                            onClick={() => setScheduleUser(user)}
                          />
                        )}
                        <ActionIconButton
                          action="edit"
                          label="Editar"
                          onClick={() => handleShowEdit(user)}
                        />
                        {!hasFullAccess(user.role?.name) && (
                          <ActionIconButton
                            action="logout"
                            label="Cerrar sesiones"
                            disabled={revokeSessions.isPending}
                            onClick={() => handleRevoke(user)}
                          />
                        )}
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
