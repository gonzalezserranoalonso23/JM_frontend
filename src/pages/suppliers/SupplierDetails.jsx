import { Card } from '@/components/ui/card'
const SupplierDetails = () => {
  return (
    <div className="py-6">
      <div className="page-content-shell">
        <Card
          role="region"
          aria-labelledby="supplier-details-title"
          className="gap-4 p-4 sm:p-6"
        >
          <h1 id="supplier-details-title" className="text-xl font-semibold">
            Detalle de proveedor
          </h1>
        </Card>
      </div>
    </div>
  )
}

export default SupplierDetails
