import { useState } from 'react'
import {
  useGetUsers,
  useRegisterUser,
  useUpdateUser,
  useDeleteUser
} from '../../features/users.features'
import Loading from '../../ui/Loading'
import ModalUsers from './components/ModalUsers'

const SectionUsers = () => {
  const { data: users, isLoading, isError } = useGetUsers()
  const registerUser = useRegisterUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [search, setSearch] = useState('')
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
      <div
        className="alert-minimal alert-danger-minimal"
        style={{ margin: '2rem' }}
      >
        Error al cargar los usuarios
      </div>
    )

  const filtered = users?.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.username?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  })

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
      {filtered?.length > 0 ? (
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
              {filtered.map((user) => (
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
                    <button
                      className="btn-action btn-info-sm"
                      style={{ marginRight: '0.4rem' }}
                      onClick={() => handleShowEdit(user)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-action btn-danger-sm"
                      onClick={() => handleDelete(user._id)}
                    >
                      Borrar
                    </button>
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
              Total: {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
            </caption>
          </table>
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
