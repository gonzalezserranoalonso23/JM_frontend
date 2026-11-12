import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/atoms/card'
import Skeleton from '@/components/atoms/skeleton'
import { useGetLiveInformation } from '@/features/inventory.features'
import { useGetPaymentTypes } from '@/features/paymentTypes.features'
import { formatMoney } from '@/utils/commonFunctions'
import { todayLocal } from '@/utils/dateDisplay'

const TodaySalesCard = () => {
  const date = todayLocal()
  const { data, isLoading, isError } = useGetLiveInformation(date)
  const {
    data: paymentTypes,
    isLoading: typesLoading,
    isError: typesError
  } = useGetPaymentTypes()
  const amounts = new Map(
    (data?.payments ?? []).map((row) => [String(row.paymentType), row.total])
  )
  const figures = paymentTypes.map((payment) => ({
    label: payment.label,
    value: amounts.get(String(payment.value)) ?? 0
  }))
  figures.push({ label: 'Total', value: data?.totalSales })
  const loading = isLoading || typesLoading
  const failed = isError || typesError

  let body = (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {figures.map((figure) => (
        <div key={figure.label} className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">
            {figure.label}
          </dt>
          <dd className="mt-1 text-lg font-bold text-foreground">
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              formatMoney(figure.value)
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
  if (failed) {
    body = (
      <p className="text-sm text-destructive">
        No se pudieron cargar las ventas del día.
      </p>
    )
  }

  return (
    <Card
      as="section"
      className="gap-3 p-4"
      aria-labelledby="today-sales-title"
    >
      <CardHeader className="px-0">
        <CardTitle>
          <h2 id="today-sales-title" className="text-base font-semibold">
            Ventas del día
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-16 px-0">{body}</CardContent>
    </Card>
  )
}

export default TodaySalesCard
