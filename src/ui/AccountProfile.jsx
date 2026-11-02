import { useState } from 'react'
import { CircleUser } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useGetCurrentUser } from '@/features/users.features'
import ScheduleDays from '@/pages/users/components/ScheduleDays'
import { hasSchedule } from '@/pages/users/schedule'
import { getTheme, setTheme } from '@/ui/theme'

const Field = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 break-words text-right font-medium">{children}</dd>
  </div>
)

const AccountProfile = () => {
  const [open, setOpen] = useState(false)
  const [theme, setThemeState] = useState(getTheme)
  const { data: user, isLoading, isError } = useGetCurrentUser(open)
  const showSchedule = Boolean(user) && (!user.isAdmin || hasSchedule(user))

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
              <dl className="divide-y">
                <Field label="Usuario">{user.username}</Field>
                <Field label="Nombre">{user.fullName || '—'}</Field>
                <Field label="Correo">{user.email}</Field>
                <Field label="Rol">
                  {user.isAdmin ? 'Administrador' : 'Usuario'}
                </Field>
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
                variant={theme === 'light' ? 'default' : 'outline'}
                aria-pressed={theme === 'light'}
                onClick={() => chooseTheme('light')}
              >
                Claro
              </Button>
              <Button
                type="button"
                size="sm"
                variant={theme === 'dark' ? 'default' : 'outline'}
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
