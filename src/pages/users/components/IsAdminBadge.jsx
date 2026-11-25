import { Badge } from '@/components/atoms/badge'

const IsAdminBadge = ({ user }) => {
  const label = user.isAdmin ? 'Administrador' : 'Usuario'
  const variant = user.isAdmin ? 'outline' : 'secondary'
  const className = user.isAdmin ? 'shrink-0 text-amber-400' : 'shrink-0'

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

export default IsAdminBadge
