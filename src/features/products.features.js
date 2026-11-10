import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getProductsPage,
  getPromotionProductsPage,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/services/products.services'
import {
  applyProductUpdate,
  applyStockDeltas,
  prependProduct,
  removeProduct,
  withRelations
} from '@/features/liveCache'

export const useGetPromotionPages = (search = '', category = '') =>
  useInfiniteQuery({
    queryKey: ['Products', 'promotions', search, category],
    queryFn: ({ pageParam }) =>
      getPromotionProductsPage({
        page: pageParam,
        limit: 20,
        search,
        category
      }),
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useGetProductPages = (search = '') =>
  useInfiniteQuery({
    queryKey: ['Products', 'pages', search],
    queryFn: ({ pageParam }) =>
      getProductsPage({ page: pageParam, limit: 20, search }),
    staleTime: 0,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useSearchProducts = (search = '') =>
  useQuery({
    queryKey: ['Products', 'lookup', search],
    queryFn: () => getProductsPage({ page: 1, limit: 10, search }),
    enabled: search.length > 0,
    placeholderData: keepPreviousData
  })

// Primera página del catálogo, o el resultado de lo que se escribe en el combobox.
export const useProductLookup = (search = '', enabled = true) =>
  useQuery({
    queryKey: ['Products', 'combobox', search],
    queryFn: () => getProductsPage({ page: 1, limit: 20, search }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000
  })

const catalogsOf = (queryClient) => ({
  suppliers: queryClient.getQueryData(['Suppliers']),
  categories: queryClient.getQueryData(['Categories'])
})

const writeProductCaches = (queryClient, update) => {
  for (const key of ['Products', 'LowStockProducts']) {
    queryClient.setQueriesData({ queryKey: [key] }, update)
  }
}

const refreshProducts = (queryClient, updated) => {
  if (updated?._id) {
    const catalogs = catalogsOf(queryClient)
    writeProductCaches(queryClient, (current) =>
      applyProductUpdate(current, updated, catalogs)
    )
  }
  queryClient.invalidateQueries({ queryKey: ['Products'] })
  queryClient.invalidateQueries({ queryKey: ['LowStockProducts'] })
}

export const applyStockToCatalog = (queryClient, deltas) => {
  if (!deltas || !Object.values(deltas).some((delta) => delta)) return
  writeProductCaches(queryClient, (current) =>
    applyStockDeltas(current, deltas)
  )
  queryClient.invalidateQueries({ queryKey: ['Products'] })
  queryClient.invalidateQueries({ queryKey: ['LowStockProducts'] })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  const mutationDelete = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_result, id) => {
      toast.success('Producto borrado exitosamente!')
      writeProductCaches(queryClient, (current) => removeProduct(current, id))
      queryClient.invalidateQueries({ queryKey: ['Products'] })
      queryClient.invalidateQueries({ queryKey: ['LowStockProducts'] })
    }
  })
  return mutationDelete
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  const mutationUpdate = useMutation({
    mutationFn: updateProduct,
    onSuccess: (updated) => {
      toast.success('Producto actualizado exitosamente!')
      refreshProducts(queryClient, updated)
    }
  })
  return mutationUpdate
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  const mutationCreate = useMutation({
    mutationFn: createProduct,
    onSuccess: (created) => {
      toast.success('Producto creado exitosamente!')
      const product = withRelations(created, catalogsOf(queryClient))
      for (const [queryKey, current] of queryClient.getQueriesData({
        queryKey: ['Products', 'pages']
      })) {
        if (queryKey[2]) continue
        queryClient.setQueryData(queryKey, prependProduct(current, product))
      }
      queryClient.invalidateQueries({ queryKey: ['Products'] })
    }
  })
  return mutationCreate
}
