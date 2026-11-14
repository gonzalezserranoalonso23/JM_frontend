import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/atoms/card'
import Skeleton from '@/components/atoms/skeleton'

export const SalesCard = ({ id, title, aside, children }) => (
  <Card as="section" className="gap-4 p-4 sm:p-6" aria-labelledby={id}>
    <CardHeader className="flex flex-col items-start gap-3 px-0">
      <CardTitle>
        <h2 id={id} className="text-lg font-semibold">
          {title}
        </h2>
      </CardTitle>
      {aside}
    </CardHeader>
    <CardContent className="px-0">{children}</CardContent>
  </Card>
)

const figureLabel = (value) => {
  const text = String(value ?? '').toLocaleLowerCase('es-MX')
  return text.charAt(0).toLocaleUpperCase('es-MX') + text.slice(1)
}

export const SalesFigures = ({ items, loading }) => (
  <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
    {items.map((item) => (
      <div key={item.label} className="min-w-0">
        <dt className="text-sm font-medium text-muted-foreground">
          {figureLabel(item.label)}
        </dt>
        <dd className="mt-1 text-lg font-bold text-foreground tabular-nums xl:text-2xl">
          {loading ? (
            <Skeleton className="h-7 w-24 xl:h-8 xl:w-28" />
          ) : (
            item.value
          )}
        </dd>
      </div>
    ))}
  </dl>
)
