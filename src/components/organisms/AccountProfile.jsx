import { useState } from 'react'
import { CircleUser } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/atoms/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/atoms/tooltip'
import { useGetCurrentUser } from '@/features/users.features'
import useLocationPrompt from '@/hooks/useLocationPrompt'
import { AttendancePunch } from '@/pages/attendance/Attendance'
import ScheduleDays from '@/pages/users/components/ScheduleDays'
import { hasFullAccess } from '@/auth/access'
import { hasSchedule } from '@/pages/users/schedule'
import { getTheme, setTheme } from '@/ui/theme'

const Field = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 break-words text-right font-medium">{children}</dd>
  </div>
)

const roleName = (user) => {
  if (user.role?.name) return user.role.name
  return '—'
}

const showsPunch = (user) => user?.role?.name === 'Supervisor'

const showsSchedule = (user) => {
  if (!user) return false
  if (hasFullAccess(user.role?.name)) return hasSchedule(user)
  return true
}

const themeVariant = (theme, name) => {
  if (theme === name) return 'default'
  return 'outline'
}

const PermissionPrompts = ({ notifications, location }) => {
  const handleNotifications = () => notifications.request()
  const handleLocation = () => location.request()
  if (!notifications?.show && !location.show) return null
  return (
    <section aria-labelledby="account-permissions">
      <h2 id="account-permissions" className="text-sm font-semibold">
        Permisos
      </h2>
      <div className="mt-2 flex flex-col gap-2">
        {notifications?.show && (
          <Button type="button" variant="outline" onClick={handleNotifications}>
            Activar notificaciones
          </Button>
        )}
        {location.show && (
          <Button type="button" variant="outline" onClick={handleLocation}>
            Permitir ubicación
          </Button>
        )}
      </div>
    </section>
  )
}

const AccountProfile = ({ notifications = null }) => {
  const [open, setOpen] = useState(false)
  const [theme, setThemeState] = useState(getTheme)
  const { data: user, isLoading, isError } = useGetCurrentUser(open)
  const location = useLocationPrompt()
  const showSchedule = showsSchedule(user)
  const showPunch = showsPunch(user)

  const chooseTheme = (next) => {
    setThemeState(setTheme(next))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 shrink-0"
              aria-label="Mi información"
            >
              <CircleUser className="h-5 w-5" aria-hidden="true" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Mi información</TooltipContent>
      </Tooltip>
      <DialogContent trackChanges={false}>
        <DialogHeader>
          <DialogTitle>Mi información</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {notifications && (
            <PermissionPrompts
              notifications={notifications}
              location={location}
            />
          )}
          {isLoading && (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              No se pudo cargar tu información
            </p>
          )}
          {user && (
            <div className="flex flex-col gap-4">
              {showPunch && <AttendancePunch />}
              <dl className="divide-y">
                <Field label="Usuario">{user.username}</Field>
                <Field label="Nombre">{user.fullName || '—'}</Field>
                <Field label="Correo">{user.email}</Field>
                <Field label="Rol">{roleName(user)}</Field>
              </dl>
              {showSchedule && (
                <section aria-labelledby="account-schedule">
                  <h2 id="account-schedule" className="text-sm font-semibold">
                    Horario
                  </h2>
                  <ScheduleDays schedule={user.schedule} />
                </section>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-4 border-t pt-4">
            <span className="text-sm text-muted-foreground">Tema</span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={themeVariant(theme, 'light')}
                aria-pressed={theme === 'light'}
                onClick={() => chooseTheme('light')}
              >
                Claro
              </Button>
              <Button
                type="button"
                size="sm"
                variant={themeVariant(theme, 'dark')}
                aria-pressed={theme === 'dark'}
                onClick={() => chooseTheme('dark')}
              >
                Oscuro
              </Button>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AccountProfile
