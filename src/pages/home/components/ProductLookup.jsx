import { formatQty } from '@/utils/commonFunctions'
import { useState } from 'react'
import { useSearchProducts } from '@/features/products.features'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const formatPrice = (value) =>
  Number(value || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  })

const ProductLookup = () => {
  const [search, setSearch] = useState('')
  const term = search.trim()
  const { data, isFetching } = useSearchProducts(term)
  const products = term ? data?.data || [] : []

  return (
    <Card
      className="gap-0 overflow-hidden py-0"
      role="region"
      aria-labelledby="product-lookup-title"
    >
      <CardHeader className="border-b py-4">
        <CardTitle>
          <h2 id="product-lookup-title" className="font-semibold">
            🔎 Consultar precio y stock
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 py-5">
        <Label htmlFor="product-lookup">Buscar producto</Label>
        <Input
          id="product-lookup"
          type="search"
          placeholder="Escribe el nombre del producto..."
          autoComplete="off"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </CardContent>
      {term && products.length === 0 && (
        <p className="border-t px-6 py-4 text-sm text-muted-foreground">
          {isFetching ? 'Buscando...' : 'Sin resultados'}
        </p>
      )}
      {products.length > 0 && (
        <ul className="m-0 list-none divide-y border-t p-0">
          {products.map((product) => {
            const isOut = product.productStock === 0
            const isLow = product.productStock < product.minimumProductStock

            return (
              <li
                key={product._id}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    {product.productName}
                  </h3>
                  {product.productDescription && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.productDescription}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    Precio:{' '}
                    <strong className="text-foreground">
                      {formatPrice(product.productPrice)}
                    </strong>{' '}
                    · Stock:{' '}
                    <strong className="text-foreground">
                      {formatQty(product.productStock)}
                    </strong>
                  </p>
                </div>
                <Badge
                  variant={
                    isOut ? 'destructive' : isLow ? 'default' : 'secondary'
                  }
                  className={
                    isLow && !isOut
                      ? 'border-transparent bg-yellow-600 text-white'
                      : undefined
                  }
                >
                  {isOut ? 'Agotado' : isLow ? 'Bajo' : 'Disponible'}
                </Badge>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default ProductLookup
