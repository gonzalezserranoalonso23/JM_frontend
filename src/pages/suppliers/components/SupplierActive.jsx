import { Badge } from '@/components/atoms/badge'

const SupplierActive = ({ active }) => (
  <Badge
    variant={active ? 'outline' : 'destructive'}
    className={active ? 'shrink-0 text-emerald-400' : 'shrink-0'}
  >
    {active ? 'Activo' : 'Inactivo'}
  </Badge>
)

export default SupplierActive
