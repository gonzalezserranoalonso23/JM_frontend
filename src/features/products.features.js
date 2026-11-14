import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getProductLookup,
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
import { searchTokens } from '@/utils/productSearch'

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

// Un guardado actualiza la lista al momento. Entre visitas no se vuelve a pedir.
export const useGetProductPages = (search = '') =>
  useInfiniteQuery({
    queryKey: ['Products', 'pages', search],
    queryFn: ({ pageParam }) =>
      getProductsPage({ page: pageParam, limit: 20, search }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
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

export const useProductSuggestions = (
  search = '',
  enabled = false,
  activeOnly = false
) => {
  const term = searchTokens(search).join(' ')
  return useQuery({
    queryKey: ['ProductLookup', 'suggest', term, activeOnly],
    queryFn: ({ signal }) =>
      getProductLookup({ search: term, activeOnly, signal }),
    enabled: enabled && term.length > 0,
    staleTime: 0
  })
}

const catalogsOf = (queryClient) => ({
  suppliers: queryClient.getQueryData(['Suppliers']),
  categories: queryClient.getQueryData(['Categories'])
})

const writeProductCaches = (queryClient, update) => {
  for (const key of ['Products', 'LowStockProducts', 'ProductLookup']) {
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
      queryClient.setQueryData(['ProductLookup'], (current) =>
        prependProduct(current, product)
      )
      queryClient.invalidateQueries({ queryKey: ['Products'] })
    }
  })
  return mutationCreate
}
