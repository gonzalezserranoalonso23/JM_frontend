import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { useFormik } from 'formik'
import {
  WEEK_DAYS,
  hasSchedule,
  scheduleFromUser
} from '../schedule'

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
      password: '',
      salary: user?.salary == null ? '' : String(user.salary),
      isAdmin: user?.isAdmin === true,
      haveSchedule: hasSchedule(user),
      schedule: scheduleFromUser(user)
    },
    validate: (values) => {
      if (!values.username) return { username: 'Requerido' }
      if (!user?._id && !values.password)
        return { password: 'Requerido al crear' }
      if (!values.haveSchedule) return
      const salary = Number(values.salary)
      if (
        String(values.salary).trim() === '' ||
        !Number.isFinite(salary) ||
        salary < 0
      ) {
        return { salary: 'Indica el salario semanal en MXN' }
      }
      for (const [day, label] of WEEK_DAYS) {
        const row = values.schedule[day]
        if (!row.enabled) continue
        if (!row.start || !row.end || row.start >= row.end) {
          return {
            schedule: `Horario inválido el ${label}. La entrada tiene que ser antes de la salida.`
          }
        }
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      const payload = {
        username: values.username,
        fullName: values.fullName,
        password: values.password,
        isAdmin: values.isAdmin,
        haveSchedule: values.haveSchedule
      }
      if (payload.haveSchedule) {
        payload.schedule = values.schedule
        payload.salary = Number(values.salary)
      }
      // On edit, include password only when it was filled in.
      if (user?._id && !values.password) delete payload.password
      action.mutate(!user?._id ? payload : { id: user._id, data: payload }, {
        onSuccess: handleCloseReset
      })
    }
  })

  const scheduleAllowed = true

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
                    formik.errors.username ? 'border-destructive' : undefined
                  }
                />
                {formik.errors.username && (
                  <p className="mt-1 text-sm text-destructive">
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
                        ? 'flex-1 border-destructive'
                        : 'flex-1'
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </Button>
                </div>
                {formik.errors.password && (
                  <p className="mt-1 text-sm text-destructive">
                    {formik.errors.password}
                  </p>
                )}
              </div>
              <label
                htmlFor="isAdmin"
                className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  id="isAdmin"
                  name="isAdmin"
                  type="checkbox"
                  className="accent-primary"
                  checked={formik.values.isAdmin}
                  onChange={(event) =>
                    formik.setFieldValue('isAdmin', event.target.checked)
                  }
                />
                Es administrador
              </label>
              {scheduleAllowed && (
                <>
                  <label
                    htmlFor="haveSchedule"
                    className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      id="haveSchedule"
                      name="haveSchedule"
                      type="checkbox"
                      className="accent-primary"
                      checked={formik.values.haveSchedule}
                      onChange={(event) =>
                        formik.setFieldValue(
                          'haveSchedule',
                          event.target.checked
                        )
                      }
                    />
                    Tiene horario
                  </label>
                  {formik.values.haveSchedule && (
                    <div className="flex flex-col gap-2">
                      <div className="grid gap-1">
                        <Label htmlFor="salary">Salario semanal (MXN)</Label>
                        <Input
                          id="salary"
                          name="salary"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={formik.values.salary}
                          onChange={formik.handleChange}
                          aria-invalid={Boolean(formik.errors.salary)}
                        />
                        {formik.errors.salary && (
                          <p className="text-sm text-destructive">
                            {formik.errors.salary}
                          </p>
                        )}
                      </div>
                      <Label>Horario</Label>
                      {WEEK_DAYS.map(([day, label]) => {
                        const row = formik.values.schedule[day]
                        return (
                          <div
                            key={day}
                            className="flex flex-col gap-2 border-b border-border pb-3 last:border-b-0 sm:grid sm:grid-cols-[7.5rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-2 sm:border-0 sm:pb-0"
                          >
                            <label className="flex min-h-11 items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                className="accent-primary"
                                checked={row.enabled}
                                onChange={(event) =>
                                  formik.setFieldValue(
                                    `schedule.${day}.enabled`,
                                    event.target.checked
                                  )
                                }
                              />
                              {label}
                            </label>
                            <div className="grid gap-1">
                              <span className="text-xs text-muted-foreground sm:sr-only">
                                Entrada
                              </span>
                              <Input
                                type="time"
                                aria-label={`Entrada ${label}`}
                                value={row.start}
                                disabled={!row.enabled}
                                onChange={(event) =>
                                  formik.setFieldValue(
                                    `schedule.${day}.start`,
                                    event.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="grid gap-1">
                              <span className="text-xs text-muted-foreground sm:sr-only">
                                Salida
                              </span>
                              <Input
                                type="time"
                                aria-label={`Salida ${label}`}
                                value={row.end}
                                disabled={!row.enabled}
                                onChange={(event) =>
                                  formik.setFieldValue(
                                    `schedule.${day}.end`,
                                    event.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        )
                      })}
                      {formik.errors.schedule && (
                        <p className="text-sm text-destructive">
                          {formik.errors.schedule}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
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
