import { Card, CardHeader } from '@/components/ui/card'

const OrderDetails = () => {
  return (
    <div className="py-6">
      <div className="page-content-shell">
        <Card role="region" aria-labelledby="order-details-title">
          <CardHeader>
            <h1 id="order-details-title" className="text-2xl font-semibold">
              Detalle de orden
            </h1>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

export default OrderDetails
