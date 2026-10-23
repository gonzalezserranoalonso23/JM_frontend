import PageShell from '@/components/PageShell'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5]

const formatAmount = (amount) =>
  amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

const formatDenomination = (value) =>
  value < 1
    ? `$${value.toFixed(2)}`
    : `$${value.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

const Cash = () => {
  const [quantities, setQuantities] = useState({})

  const handleChange = (denomination, value) =>
    setQuantities((prev) => ({ ...prev, [denomination]: value }))

  const getQuantity = (denomination) =>
    Math.max(0, Math.floor(Number(quantities[denomination]) || 0))

  const total = DENOMINATIONS.reduce(
    (sum, denomination) => sum + denomination * getQuantity(denomination),
    0
  )

  return (
    <PageShell>
      <Card role="region" aria-labelledby="cash-title">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <h1 id="cash-title" className="text-xl font-bold">
              Calcular caja
            </h1>
          </CardTitle>
          <Button type="button" onClick={() => setQuantities({})}>
            Limpiar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 lg:hidden">
            {DENOMINATIONS.map((denomination) => (
              <Card key={denomination} className="py-3">
                <CardContent className="grid grid-cols-[1fr_6rem_1fr] items-center gap-3 px-4">
                  <strong>{formatDenomination(denomination)}</strong>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    placeholder="0"
                    className="h-9 w-full px-2 text-center"
                    aria-label={`Cantidad de ${formatDenomination(denomination)}`}
                    value={quantities[denomination] ?? ''}
                    onChange={(e) => handleChange(denomination, e.target.value)}
                  />
                  <span className="text-right text-sm">
                    {formatAmount(denomination * getQuantity(denomination))}
                  </span>
                </CardContent>
              </Card>
            ))}
            <Card className="bg-muted/30 py-3">
              <CardContent className="flex items-center justify-between px-4">
                <strong>Total en caja</strong>
                <strong>{formatAmount(total)}</strong>
              </CardContent>
            </Card>
          </div>
          <div className="hidden overflow-x-hidden rounded-lg border lg:block">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Denominación</TableHead>
                  <TableHead className="w-[34%] text-center">
                    Cantidad
                  </TableHead>
                  <TableHead className="w-[36%] text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DENOMINATIONS.map((denomination) => (
                  <TableRow key={denomination}>
                    <TableCell>
                      <strong>{formatDenomination(denomination)}</strong>
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        placeholder="0"
                        className="mx-auto h-9 w-full max-w-28 px-2 text-center"
                        aria-label={`Cantidad de ${formatDenomination(denomination)}`}
                        value={quantities[denomination] ?? ''}
                        onChange={(e) =>
                          handleChange(denomination, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatAmount(denomination * getQuantity(denomination))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot className="border-t bg-muted/50 font-medium">
                <TableRow>
                  <TableCell colSpan={2} className="text-right">
                    <strong>Total en caja</strong>
                  </TableCell>
                  <TableCell className="text-right">
                    <strong>{formatAmount(total)}</strong>
                  </TableCell>
                </TableRow>
              </tfoot>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}

export default Cash
