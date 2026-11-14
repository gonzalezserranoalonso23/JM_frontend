import { useGetLiveInformation } from '@/features/inventory.features'
import { useGetPaymentTypes } from '@/features/paymentTypes.features'
import { formatMoney } from '@/utils/commonFunctions'
import { todayLocal } from '@/utils/dateDisplay'
import { SalesCard, SalesFigures } from './SalesCard'

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
  const figures = (paymentTypes || []).map((payment) => ({
    label: payment.label,
    value: formatMoney(amounts.get(String(payment.value)) ?? 0)
  }))
  figures.push({ label: 'Total', value: formatMoney(data?.totalSales) })
  const loading = isLoading || typesLoading
  const failed = isError || typesError

  return (
    <SalesCard id="today-sales-title" title="Ventas del día">
      {failed ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar las ventas del día.
        </p>
      ) : (
        <SalesFigures items={figures} loading={loading} />
      )}
    </SalesCard>
  )
}

export default TodaySalesCard
