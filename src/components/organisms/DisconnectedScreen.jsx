import { useState } from 'react'
import { Unplug } from 'lucide-react'
import { useFormik } from 'formik'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { useSupportLogin } from '@/features/app.features'
import { useLogin } from '@/features/users.features'
import { verifyLogin } from '@/helpers/validations'

const DisconnectedScreen = () => {
  const support = useSupportLogin()
  const login = useLogin()
  const [supportOpen, setSupportOpen] = useState(false)
  const [entering, setEntering] = useState(false)
  const [denied, setDenied] = useState(false)
  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validate: verifyLogin,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => login.mutate(values)
  })
  const supportForm = useFormik({
    initialValues: { username: '' },
    validate: (values) => {
      if (!values.username.trim()) return { username: 'El usuario es requerido' }
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      const username = values.username.trim()
      setDenied(false)
      support.mutate(username, {
        onSuccess: (data) => {
          if (!data?.allowed) {
            setDenied(true)
            return
          }
          formik.setFieldValue('username', username)
          setSupportOpen(false)
          setEntering(true)
        }
      })
    }
  })

  const closeSupport = () => {
    setSupportOpen(false)
    setDenied(false)
    supportForm.resetForm()
  }

  const openSupport = () => {
    setDenied(false)
    setSupportOpen(true)
  }

  return (
    <main className="relative flex h-dvh min-h-0 w-full flex-1 flex-col bg-background px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <Unplug className="size-24" strokeWidth={1.5} aria-hidden="true" />
        <h1 className="text-3xl font-semibold">Desconectada</h1>
        {entering && (
          <form
            className="flex w-full max-w-xs flex-col gap-3"
            onSubmit={formik.handleSubmit}
          >
            <div>
              <Label htmlFor="shutdown-username">Usuario</Label>
              <Input
                id="shutdown-username"
                name="username"
                autoComplete="username"
                value={formik.values.username}
                onChange={formik.handleChange}
              />
            </div>
            <div>
              <Label htmlFor="shutdown-password">Contraseña</Label>
              <Input
                id="shutdown-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
              />
            </div>
            <Button
              type="submit"
              className="!h-9 !min-h-9 w-fit px-3"
              disabled={login.isPending}
            >
              Entrar
            </Button>
          </form>
        )}
      </div>
      <footer className="pb-8 text-center">
        <p
          className="cursor-pointer text-sm underline underline-offset-4"
          onClick={openSupport}
        >
          support@site.com
        </p>
      </footer>
      {supportOpen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 px-6">
          <form
            className="flex w-full max-w-xs flex-col gap-4 rounded-lg bg-background p-5"
            onSubmit={supportForm.handleSubmit}
            aria-labelledby="support-title"
          >
            <h2 id="support-title" className="text-lg font-semibold">
              Soporte
            </h2>
            <div>
              <Label htmlFor="support-username">Usuario</Label>
              <Input
                id="support-username"
                name="username"
                autoComplete="username"
                value={supportForm.values.username}
                onChange={supportForm.handleChange}
              />
              {supportForm.errors.username && (
                <p className="mt-1 text-sm text-destructive">
                  {supportForm.errors.username}
                </p>
              )}
              {denied && (
                <p className="mt-1 text-sm text-destructive">
                  No se puede continuar
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="!h-9 !min-h-9 w-fit px-3"
                disabled={support.isPending}
              >
                Continuar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="!h-9 !min-h-9 w-fit px-3"
                onClick={closeSupport}
              >
                Cerrar
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}

export default DisconnectedScreen
