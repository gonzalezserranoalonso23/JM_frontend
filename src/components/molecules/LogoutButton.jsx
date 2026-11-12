import { LogOut } from 'lucide-react'
import { Button } from '@/components/atoms/button'

export const StaffLogoutButton = ({ onLogout }) => (
  <Button
    type="button"
    variant="destructive"
    size="icon-sm"
    className="shrink-0"
    aria-label="Cerrar sesión"
    onClick={onLogout}
  >
    <LogOut className="h-4 w-4" aria-hidden="true" />
  </Button>
)

export const AdminLogoutButton = ({ onLogout }) => (
  <Button
    type="button"
    variant="destructive"
    size="sm"
    onClick={onLogout}
    className="hidden shrink-0 xl:inline-flex"
  >
    Cerrar sesión
  </Button>
)
