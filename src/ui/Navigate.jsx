import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import { useState } from 'react'

const Navigate = () => {
  const logOut = useAuthStore((state) => state.logOut)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const navigate = useNavigate()
  const { dark, toggleTheme } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogOut = () => {
    logOut()
    toast.success('Cierre de sesión exitoso!')
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-dark text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="../home" className="flex items-center font-bold text-lg">
            <span>JM Panel</span>
          </Link>

          {/* Toggle Button (Mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-block p-2 rounded hover:bg-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="../home" className="hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link
              to="../issues"
              className="hover:text-primary transition-colors"
            >
              Salidas
            </Link>
            <Link
              to="../entries"
              className="hover:text-primary transition-colors"
            >
              Entradas
            </Link>
            <Link
              to="../orders"
              className="hover:text-primary transition-colors"
            >
              Órdenes
            </Link>
            <Link
              to="../todolist"
              className="hover:text-primary transition-colors"
            >
              Pendientes
            </Link>
            <Link
              to="../reports"
              className="hover:text-primary transition-colors"
            >
              Reportes
            </Link>
            {isAdmin && (
              <Link
                to="../catalogs"
                className="hover:text-primary transition-colors"
              >
                Catálogo
              </Link>
            )}
            <button
              onClick={toggleTheme}
              title={dark ? 'Modo claro' : 'Modo oscuro'}
              className="px-3 py-2 rounded-sm transition-colors hover:bg-gray-700"
              style={{ fontSize: '1.1rem' }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogOut}
              className="bg-warning text-dark px-4 py-2 rounded-sm font-medium hover:bg-warning/90 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="../home"
              className="block px-4 py-2 hover:bg-gray-700 rounded"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="../issues"
              className="block px-4 py-2 hover:bg-gray-700 rounded"
              onClick={() => setIsOpen(false)}
            >
              Salidas
            </Link>
            <Link
              to="../entries"
              className="block px-4 py-2 hover:bg-gray-700 rounded"
              onClick={() => setIsOpen(false)}
            >
              Entradas
            </Link>
            <Link
              to="../orders"
              className="block px-4 py-2 hover:bg-gray-700 rounded"
              onClick={() => setIsOpen(false)}
            >
              Órdenes
            </Link>
            <Link
              to="../todolist"
              className="block px-4 py-2 hover:bg-gray-700 rounded"
              onClick={() => setIsOpen(false)}
            >
              Pendientes
            </Link>
            <Link
              to="../reports"
              className="block px-4 py-2 hover:bg-gray-700 rounded"
              onClick={() => setIsOpen(false)}
            >
              Reportes
            </Link>
            {isAdmin && (
              <Link
                to="../catalogs"
                className="block px-4 py-2 hover:bg-gray-700 rounded"
                onClick={() => setIsOpen(false)}
              >
                Catálogo
              </Link>
            )}
            <button
              onClick={() => {
                handleLogOut()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 bg-warning text-dark rounded hover:bg-warning/90 font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigate
