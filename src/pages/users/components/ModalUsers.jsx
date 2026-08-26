import { useState } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  TextInput,
  Select
} from 'flowbite-react'
import { useFormik } from 'formik'

const ModalUsers = ({
  user,
  modalShow,
  handleClose,
  action,
  type,
  setUpdate
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: user?.username || '',
      fullName: user?.fullName || '',
      email: user?.email || '',
      password: '',
      isAdmin: user?.isAdmin?.toString() ?? 'false'
    },
    validate: (values) => {
      if (!values.username) return { username: 'Requerido' }
      if (!values.email) return { email: 'Requerido' }
      if (!user?._id && !values.password)
        return { password: 'Requerido al crear' }
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      const payload = { ...values }
      // Al editar, solo incluir password si se llenó
      if (user?._id && !values.password) delete payload.password
      action.mutate(!user?._id ? payload : { id: user._id, data: payload })
      formik.resetForm()
      handleClose()
    }
  })

  const handleCloseReset = () => {
    formik.resetForm()
    setUpdate(false)
    handleClose()
  }

  return (
    <Modal
      show={modalShow}
      onClose={handleCloseReset}
      size="md"
      className="z-[9999]"
    >
      <ModalHeader>{type} usuario</ModalHeader>
      <form onSubmit={formik.handleSubmit}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Usuario *
              </label>
              <TextInput
                {...formik.getFieldProps('username')}
                id="username"
                type="text"
                placeholder="nombre_usuario"
                color={formik.errors.username ? 'failure' : undefined}
                helperText={formik.errors.username}
              />
            </div>
            <div>
              <label
                htmlFor="fullName"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Nombre completo
              </label>
              <TextInput
                {...formik.getFieldProps('fullName')}
                id="fullName"
                type="text"
                placeholder="Nombre Apellido"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Correo electrónico *
              </label>
              <TextInput
                {...formik.getFieldProps('email')}
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                color={formik.errors.email ? 'failure' : undefined}
                helperText={formik.errors.email}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                {user?._id
                  ? 'Nueva contraseña (dejar vacío para no cambiar)'
                  : 'Contraseña *'}
              </label>
              <div
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <TextInput
                  {...formik.getFieldProps('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{ flex: 1 }}
                  color={formik.errors.password ? 'failure' : undefined}
                  helperText={formik.errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-action btn-info-sm"
                  title={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="isAdmin"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Rol
              </label>
              <Select
                id="isAdmin"
                name="isAdmin"
                {...formik.getFieldProps('isAdmin')}
              >
                <option value="false">Usuario</option>
                <option value="true">Administrador</option>
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="dark" onClick={handleCloseReset}>
            Cancelar
          </Button>
          <Button color="warning" type="submit" isProcessing={action.isPending}>
            {type} usuario
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default ModalUsers
