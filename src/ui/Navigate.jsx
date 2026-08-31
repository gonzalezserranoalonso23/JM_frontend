import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { useState } from 'react'

const Navigate = () => {
  const logOut = useAuthStore((state) => state.logOut)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogOut = () => {
    logOut()
    toast.success('Cierre de sesión exitoso!')
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black text-gray-400 shadow-[0_4px_20px_rgba(0,0,0,0.35)] z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="../home"
            className="flex items-center font-bold text-lg text-gray-300 hover:text-white transition-colors"
          >
            <span>JM Panel</span>
          </Link>

          {/* Toggle Button (Mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-block p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800"
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
            <Link
              to="../home"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="../issues"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Salidas
            </Link>
            <Link
              to="../entries"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Entradas
            </Link>
            <Link
              to="../orders"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Órdenes
            </Link>
            <Link
              to="../todolist"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Pendientes
            </Link>
            <Link
              to="../reports"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Reportes
            </Link>
            {isAdmin && (
              <Link
                to="../catalogs"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Catálogo
              </Link>
            )}
            <button
              onClick={handleLogOut}
              className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-sm font-medium hover:bg-red-600 transition-colors"
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
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="../issues"
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
              onClick={() => setIsOpen(false)}
            >
              Salidas
            </Link>
            <Link
              to="../entries"
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
              onClick={() => setIsOpen(false)}
            >
              Entradas
            </Link>
            <Link
              to="../orders"
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
              onClick={() => setIsOpen(false)}
            >
              Órdenes
            </Link>
            <Link
              to="../todolist"
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
              onClick={() => setIsOpen(false)}
            >
              Pendientes
            </Link>
            <Link
              to="../reports"
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
              onClick={() => setIsOpen(false)}
            >
              Reportes
            </Link>
            {isAdmin && (
              <Link
                to="../catalogs"
                className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
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
              className="w-full text-left px-4 py-2 bg-yellow-400 text-gray-900 rounded hover:bg-red-600 font-medium"
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
