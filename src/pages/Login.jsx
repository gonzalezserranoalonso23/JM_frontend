import { useFormik } from 'formik'
import { Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useEffect } from 'react'
import { verifyLogin } from '@/helpers/validations'
import { useLogin } from '@/features/users.features'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader
} from '@/components/ui/card'

const REMEMBER_KEY = 'jm-remembered-user'

const readRemembered = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) || ''
  } catch {
    return ''
  }
}

const Login = () => {
  const login = useLogin()
  const auth = useAuthStore((state) => state.auth)
  const logOut = useAuthStore((state) => state.logOut)

  const formik = useFormik({
    initialValues: {
      username: readRemembered(),
      password: '',
      remember: true
    },
    validate: verifyLogin,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      try {
        if (values.remember) {
          localStorage.setItem(REMEMBER_KEY, values.username)
        } else {
          localStorage.removeItem(REMEMBER_KEY)
        }
      } catch {
        // no-op
      }
      login.mutate(values)
    }
  })

  let isTokenExpired = false

  if (auth) {
    try {
      const decoded = jwtDecode(auth)
      isTokenExpired = Date.now() >= decoded.exp * 1000
    } catch {
      isTokenExpired = true
    }
  }

  useEffect(() => {
    document.title = 'Iniciar sesión | JM Panel'
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        'Acceso al panel de gestión de inventario de Mini Super JM.'
      )
  }, [])

  useEffect(() => {
    if (auth && isTokenExpired) {
      logOut()
    }
  }, [auth, isTokenExpired, logOut])

  if (auth && !isTokenExpired) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center overflow-y-auto bg-background px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <h1 className="text-2xl leading-none font-bold">Mini Super JM</h1>
          <CardDescription>Inicia sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                {...formik.getFieldProps('username')}
                id="username"
                name="username"
                autoComplete="username"
                type="text"
                placeholder="Ingresa tu usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                {...formik.getFieldProps('password')}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            <label
              htmlFor="remember"
              className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
            >
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="accent-primary"
                checked={formik.values.remember}
                onChange={formik.handleChange}
              />
              Recuérdame
            </label>
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
