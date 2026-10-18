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

const TableCatalogs = () => {
  const items = [
    { name: 'Productos', path: '../products' },
    { name: 'Proveedores', path: '../suppliers' },
    { name: 'Categorías', path: '../categories' },
    { name: 'Métodos de pago', path: '../payment-types' },
    { name: 'Usuarios', path: '../users' }
  ]

  return (
    <div>
      <div className="space-y-3 lg:hidden">
        {items.map((item) => (
          <Card key={item.name} className="py-4">
            <CardContent className="flex items-center justify-between gap-3 px-4">
              <p className="font-medium">{item.name}</p>
              <Button asChild variant="outline" size="sm">
                <Link to={item.path}>Ver</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="hidden rounded-lg border lg:block">
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
