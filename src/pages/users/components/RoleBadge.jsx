import { Badge } from '@/components/atoms/badge'

const RoleBadge = ({ user }) => {
  const name = user.role?.name
  let label = '—'
  let variant = 'secondary'
  let className = 'shrink-0'
  if (name) {
    label = name
    if (name === 'Manager') {
      variant = 'outline'
      className = 'shrink-0 text-amber-400'
    }
  }
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

export default RoleBadge
