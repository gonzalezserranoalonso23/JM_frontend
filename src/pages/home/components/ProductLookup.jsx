import { formatCurrency, formatQty } from '@/utils/commonFunctions'
import { searchTokens } from '@/utils/productSearch'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchProducts } from '@/features/products.features'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/atoms/dialog'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/atoms/tooltip'

const ProductLookup = () => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const typed = search.trim()
  const settled = searchTokens(typed).join(' ')
  const term = useDebouncedValue(settled, 200)
  const { data, isFetching } = useSearchProducts(open ? term : '')
  const products = term ? data?.data || [] : []
  const pending = typed.length > 0 && (term !== settled || isFetching)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 shrink-0"
              aria-label="Consulta producto"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Consulta producto</TooltipContent>
      </Tooltip>
      <DialogContent trackChanges={false} className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Consultar precio y stock</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <Label htmlFor="product-lookup">Buscar producto</Label>
            <Input
              id="product-lookup"
              type="search"
              placeholder="Escribe el nombre del producto..."
              autoComplete="off"
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          {typed && products.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {pending ? 'Buscando...' : 'Sin resultados'}
            </p>
          )}
          {products.length > 0 && (
            <ul className="m-0 list-none divide-y rounded-lg border p-0">
              {products.map((product) => {
                const isOut = product.productStock === 0
                const isLow = product.productStock < product.minimumProductStock

                return (
                  <li key={product._id}>
                    <article className="flex items-start justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-medium text-foreground">
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
                            {formatCurrency(product.productPrice)}
                          </strong>{' '}
                          · Stock:{' '}
                          <strong className="text-foreground">
                            {formatQty(product.productStock)}
                          </strong>
                        </p>
                      </div>
                      <Badge
                        variant={
                          isOut
                            ? 'destructive'
                            : isLow
                              ? 'default'
                              : 'secondary'
                        }
                        className={
                          isLow && !isOut
                            ? 'mt-0.5 shrink-0 border-transparent bg-yellow-600 text-white'
                            : 'mt-0.5 shrink-0'
                        }
                      >
                        {isOut ? 'Agotado' : isLow ? 'Bajo' : 'Disponible'}
                      </Badge>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export default ProductLookup
