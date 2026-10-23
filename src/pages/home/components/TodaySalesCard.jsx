import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetLiveInformation } from '@/features/inventory.features'
import { formatMoney } from '@/utils/commonFunctions'
import { todayLocal } from '@/utils/dateDisplay'

const TodaySalesCard = () => {
  const date = todayLocal()
  const { data, isLoading, isError } = useGetLiveInformation(date)
  const figures = [
    ['Efectivo', data?.cashSales],
    ['Tarjeta', data?.cardSales],
    ['Total', data?.totalSales]
  ]

  return (
    <Card className="gap-3 p-4" aria-labelledby="today-sales-title">
      <CardHeader className="px-0">
        <CardTitle>
          <h2 id="today-sales-title" className="text-base font-semibold">
            Ventas del día
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando ventas...</p>
        ) : isError ? (
          <p className="text-sm text-destructive">
            No se pudieron cargar las ventas del día.
          </p>
        ) : (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {figures.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 text-lg font-bold text-foreground">
                  {formatMoney(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}

export default TodaySalesCard
