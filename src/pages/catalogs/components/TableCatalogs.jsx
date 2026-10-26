import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'

const TableCatalogs = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const items = [
    { name: 'Productos', path: '../products' },
    { name: 'Proveedores', path: '../suppliers' },
    { name: 'Categorías', path: '../categories', adminOnly: true },
    { name: 'Métodos de pago', path: '../payment-types', adminOnly: true },
    { name: 'Usuarios', path: '../users', adminOnly: true }
  ].filter((item) => isAdmin || !item.adminOnly)

  return (
    <div>
      <div className="space-y-3 xl:hidden">
        {items.map((item) => (
          <Card as="article" key={item.name} className="py-4">
            <CardContent className="flex items-center justify-between gap-3 px-4">
              <h2 className="font-medium">{item.name}</h2>
              <Button asChild variant="outline" size="sm">
                <Link to={item.path}>Ver</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="hidden rounded-lg border xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.name}>
                <TableCell>
                  <strong>{item.name}</strong>
                </TableCell>
                <TableCell className="text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link to={item.path}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default TableCatalogs
