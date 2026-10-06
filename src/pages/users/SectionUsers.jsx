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

const SectionUsers = () => {
  const [search, setSearch] = useState('')
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
    <div className="section-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h4 className="section-title">Usuarios</h4>
          <p className="section-subtitle">Gestión de cuentas del sistema</p>
        </div>
        <button
          className="btn-custom btn-primary-custom"
          onClick={handleShowCreate}
        >
          + Nuevo Usuario
        </button>
      </div>

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
      <div className="filter-section">
        <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por usuario, nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

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
                      <button
                        className="btn-action btn-info-sm w-full sm:w-auto"
                        onClick={() => handleShowEdit(user)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-action btn-danger-sm w-full sm:w-auto"
                        onClick={() => handleDelete(user._id)}
                      >
                        Borrar
                      </button>
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
          {hasNextPage && !supportsIntersectionObserver && (
            <button
              type="button"
              className="w-full py-3 text-sm font-medium"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
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
    </div>
  )
}

export default SectionUsers
