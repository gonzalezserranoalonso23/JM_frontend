import { useState } from 'react'
import {
  useGetUserPages,
  useRegisterUser,
  useUpdateUser,
  useDeleteUser
} from '@/features/users.features'
import Loading from '@/ui/Loading'
import ModalUsers from './components/ModalUsers'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
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
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(
      fetchNextPage,
      Boolean(hasNextPage) && !isFetchingNextPage
    )

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
      <div
        className="alert-minimal alert-danger-minimal"
        style={{ margin: '2rem' }}
      >
        Error al cargar los usuarios
      </div>
    )

  return (
    <section className="section-container" aria-labelledby="users-title">
      {/* Header */}
      <header className="section-header">
        <div>
          <h1 id="users-title" className="section-title">
            Usuarios
          </h1>
          <p className="section-subtitle">Gestión de cuentas del sistema</p>
        </div>
        <button
          className="btn-custom btn-primary-custom"
          onClick={handleShowCreate}
        >
          + Nuevo Usuario
        </button>
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
        <div className="table-wrapper">
          <table className="table-minimal">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre completo</th>
                <th>Email</th>
                <th>Rol</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>
                    {user.fullName || (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td>
                    <small>{user.email}</small>
                  </td>
                  <td>
                    <span
                      className={`badge-minimal ${user.isAdmin ? 'badge-warning' : 'badge-info'}`}
                    >
                      {user.isAdmin ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="text-center">
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
                  </td>
                </tr>
              ))}
            </tbody>
            <caption
              style={{
                fontSize: '0.8rem',
                color: '#9ca3af',
                marginTop: '0.5rem'
              }}
            >
              Total: {totalUsers} usuario{totalUsers !== 1 ? 's' : ''}
            </caption>
          </table>
          {hasNextPage && supportsIntersectionObserver && (
            <div ref={sentinelRef} className="h-1" aria-hidden="true" />
          )}
          {isFetchingNextPage && supportsIntersectionObserver && (
            <Loading fullScreen={false} />
          )}
          {hasNextPage && !supportsIntersectionObserver && (
            <button
              type="button"
              className="w-full py-3 text-sm font-medium"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loading fullScreen={false} />
              ) : (
                'Cargar más'
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="alert-minimal alert-info-minimal">
          {search
            ? 'No se encontraron usuarios con esa búsqueda'
            : 'No hay usuarios registrados'}
        </div>
      )}
    </section>
  )
}

export default SectionUsers
