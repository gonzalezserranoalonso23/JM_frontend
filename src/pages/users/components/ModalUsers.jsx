import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
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
    <Dialog
      open={modalShow}
      onOpenChange={(open) => !open && handleCloseReset()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type} usuario</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="username">Usuario *</Label>
                <Input
                  {...formik.getFieldProps('username')}
                  id="username"
                  type="text"
                  placeholder="nombre_usuario"
                  className={
                    formik.errors.username ? 'border-red-500' : undefined
                  }
                />
                {formik.errors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.username}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  {...formik.getFieldProps('fullName')}
                  id="fullName"
                  type="text"
                  placeholder="Nombre Apellido"
                />
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  {...formik.getFieldProps('email')}
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className={formik.errors.email ? 'border-red-500' : undefined}
                />
                {formik.errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.email}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">
                  {user?._id
                    ? 'Nueva contraseña (dejar vacío para no cambiar)'
                    : 'Contraseña *'}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    {...formik.getFieldProps('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={
                      formik.errors.password
                        ? 'flex-1 border-red-500'
                        : 'flex-1'
                    }
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
                {formik.errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.password}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="isAdmin">Rol</Label>
                <Select
                  value={formik.values.isAdmin}
                  onValueChange={(value) =>
                    formik.setFieldValue('isAdmin', value)
                  }
                >
                  <SelectTrigger id="isAdmin">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Usuario</SelectItem>
                    <SelectItem value="true">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseReset}>
              Cancelar
            </Button>
            <Button type="submit" disabled={action.isPending}>
              {type} usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalUsers
