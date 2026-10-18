import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { Link } from 'react-router-dom'
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
    <div className="rounded-lg border">
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
  )
}

export default TableCatalogs
