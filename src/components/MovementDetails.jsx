import { Link, useNavigate, useParams } from 'react-router-dom'
import PageShell from '@/components/PageShell'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useGetInventoryRecord } from '@/features/inventory.features'
import Skeleton from '@/components/ui/skeleton'
import { formatMoney, formatQty } from '@/utils/commonFunctions'
import { formatDate } from '@/utils/dateDisplay'
import { isIssueRecord } from '@/utils/typeInventory'

const Field = ({ label, children }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="text-sm font-medium">{children || '—'}</dd>
  </div>
)

const MovementDetails = ({ listPath, listLabel, expectIssue }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: record, isLoading, isError } = useGetInventoryRecord(id)
  const isIssue = isIssueRecord(record)

  if (isLoading) {
    return (
      <PageShell>
        <Card as="section" aria-labelledby="movement-title">
          <CardHeader>
            <p className="text-sm text-muted-foreground">{listLabel}</p>
            <h1 id="movement-title" className="text-2xl font-semibold">
              Movimiento
            </h1>
          </CardHeader>
          <CardContent>
            <div
              role="status"
              aria-label="Cargando"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index}>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-5 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  if (isError || !record || isIssue !== expectIssue) {
    return (
      <PageShell>
        <Alert variant="destructive">
          No se encontró este movimiento.{' '}
          <Link to={listPath} className="underline">
            Volver a {listLabel}
          </Link>
        </Alert>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Card as="section" aria-labelledby="movement-title">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{listLabel}</p>
            <h1 id="movement-title" className="text-2xl font-semibold">
              {record.productName?.productName || 'Movimiento'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isIssue ? 'destructive' : 'outline'}>
              {record.typeInventory?.typeInventory}
            </Badge>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(listPath)}
            >
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Fecha">{formatDate(record.date)}</Field>
            <Field label="Categoría">{record.category?.categories}</Field>
            <Field label="Cantidad">{formatQty(record.quantity)}</Field>
            <Field label="Precio unitario">
              ${formatQty(record.productPrice)}
            </Field>
            <Field label="Total">{formatMoney(record.totalAmount)}</Field>
            {isIssue && (
              <Field label="Forma de pago">
                {record.paymentType?.paymentType || '—'}
              </Field>
            )}
          </dl>
        </CardContent>
      </Card>
    </PageShell>
  )
}

export default MovementDetails
