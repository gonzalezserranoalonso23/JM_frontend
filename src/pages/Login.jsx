import { useFormik } from 'formik'
import { Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useEffect } from 'react'
import { verifyLogin } from '../helpers/validations'
import { useLogin } from '../features/users.features'
import { useAuthStore } from '../store/auth'

const Login = () => {
  const login = useLogin()
  const auth = useAuthStore((state) => state.auth)
  const logOut = useAuthStore((state) => state.logOut)

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validate: verifyLogin,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
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
    if (auth && isTokenExpired) {
      logOut()
    }
  }, [auth, isTokenExpired, logOut])

  if (auth && !isTokenExpired) {
    return <Navigate to="/home" replace />
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          'linear-gradient(135deg, #1a252f 0%, #2c3e50 60%, #3d5166 100%)'
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
        }}
      >
        {/* Logo / Título */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#f39c12',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontSize: '1.75rem'
            }}
          >
            🛒
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#2c3e50',
              margin: 0
            }}
          >
            Mini Super JM
          </h1>
          <p
            style={{
              color: '#7f8c8d',
              fontSize: '0.875rem',
              margin: '0.5rem 0 0 0'
            }}
          >
            Inicia sesión para continuar
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label
              htmlFor="username"
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#2c3e50',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              Usuario
            </label>
            <input
              {...formik.getFieldProps('username')}
              id="username"
              name="username"
              type="text"
              placeholder="Ingresa tu usuario"
              className="form-control"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label
              htmlFor="password"
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#2c3e50',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              Contraseña
            </label>
            <input
              {...formik.getFieldProps('password')}
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="form-control"
            />
          </div>
          <button
            type="submit"
            disabled={login.isPending}
            style={{
              background: '#f39c12',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: login.isPending ? 'not-allowed' : 'pointer',
              opacity: login.isPending ? 0.7 : 1,
              marginTop: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {login.isPending ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
